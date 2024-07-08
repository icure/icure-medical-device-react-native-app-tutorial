import React, { useState } from 'react'
import { DataSample, CodingReference, Content, Measure, IContent, IDataSample } from '@icure/medical-device-sdk'
import { ScrollView, StyleSheet, View, Dimensions, Text, Image, TouchableOpacity } from 'react-native'
import { format } from 'date-fns'

import { globalStyles } from '../../styles/GlobalStyles'
import { RadioButton, CheckBox, Button, CustomInput } from '../FormElements'
import { periodFlowLevelsData, complaintsData } from '../../utils/constants'
import { ISO639_1 } from '@icure/typescript-common'

const WIDTH_MODAL = Dimensions.get('window').width
const HEIGHT_MODAL = Dimensions.get('window').height

type AddDataSamplesModalProps = {
  date: Date
  title: string
  createOrUpdateDataSamples: (dsArray: (DataSample | IDataSample)[]) => void
  deleteDataSamples: (dsArray: (DataSample | IDataSample)[]) => void
  onClose: () => void
  onSave: () => void
  onDelete: () => void
  currentFlowLevelData?: (date: Date) => IDataSample | undefined
  currentComplaintsDatas?: (date: Date) => IDataSample[]
  currentNotesData?: (date: Date) => IDataSample | undefined
}

export const AddDataSamplesModal: React.FC<AddDataSamplesModalProps> = ({
  date,
  title,
  createOrUpdateDataSamples,
  deleteDataSamples,
  onClose,
  onSave,
  onDelete,
  currentFlowLevelData,
  currentComplaintsDatas,
  currentNotesData,
}) => {
  const currentFlowLevelDataSample = currentFlowLevelData!(date)
  const currentComplaintsDataSamples = currentComplaintsDatas!(date)
  const currentNotesDataSample = currentNotesData!(date)

  const radioButtonInitialValue =
    periodFlowLevelsData.find((item) => item.flowLevel === currentFlowLevelDataSample?.content?.['en']?.measureValue?.value) ?? periodFlowLevelsData[0]

  const selectedComplaintsCodes = currentComplaintsDataSamples?.map((item) => [...item.codes][0].code)

  const comparedComplaintsArray = complaintsData.map((item: { label: string; isChecked: boolean; SNOMED_CT_CODE: string }) => {
    return { ...item, isChecked: selectedComplaintsCodes?.includes(item.SNOMED_CT_CODE) }
  })

  const [selectedFlowLevel, setSelectedFlowLevel] = useState(radioButtonInitialValue)
  const [checkedComplaints, setCheckedComplaints] = useState(comparedComplaintsArray)
  const onlyCheckedComplaints = checkedComplaints?.filter((item) => item.isChecked)
  const [notes, setNotes] = useState(currentNotesDataSample?.content?.['en']?.stringValue ?? undefined)

  const valueDate = +format(new Date(date), 'yyyyMMdd000000')
  const handleClose = () => {
    onClose()
  }
  const handleDelete = () => {
    currentComplaintsDataSamples && deleteDataSamples([...currentComplaintsDataSamples])
    currentFlowLevelDataSample && deleteDataSamples([currentFlowLevelDataSample])
    currentNotesDataSample && deleteDataSamples([currentNotesDataSample])
    onDelete()
  }

  const handleSave = () => {
    // CREATE A DATASAMPLE OBJECT ACCORDINGLY
    const flowLevelContent: Partial<Record<ISO639_1, IContent>> = {
      en: new Content({
        measureValue: new Measure({
          value: selectedFlowLevel.flowLevel,
          min: 0,
          max: 3,
        }),
      }),
    }

    const userPeriodDataSample = currentFlowLevelDataSample
      ? new DataSample({
          ...currentFlowLevelDataSample,
          content: flowLevelContent,
        })
      : new DataSample({
          valueDate,
          labels: [new CodingReference({ type: 'LOINC', code: '49033-4' })],
          content: flowLevelContent,
        })

    const getUserComplaintDataSample = (SNOMED_CODE: string) => {
      return new DataSample({
        valueDate,
        codes: [new CodingReference({ type: 'SNOMED-CT', code: SNOMED_CODE })],
        labels: [new CodingReference({ type: 'LOINC', code: '75322-8' })],
      })
    }

    const notesContent = {
      en: new Content({
        stringValue: notes,
      }),
    }

    const userNotesDataSample = currentNotesDataSample
      ? new DataSample({
          ...currentNotesDataSample,
          content: notesContent,
        })
      : new DataSample({
          valueDate,
          content: notesContent,
          labels: [new CodingReference({ type: 'LOINC', code: '34109-9' })],
        })

    const addedComplaints = onlyCheckedComplaints?.filter((item) => !selectedComplaintsCodes?.includes(item.SNOMED_CT_CODE))

    const removedComplaints =
      currentComplaintsDataSamples?.filter((item) => {
        const complaint = complaintsData.find((complaintObj) => complaintObj.SNOMED_CT_CODE === [...item.codes][0].code)
        return !onlyCheckedComplaints.some((element) => element.SNOMED_CT_CODE === complaint?.SNOMED_CT_CODE)
      }) ?? []

    const removedDataSamples = removedComplaints.concat(currentNotesDataSample?.content?.['en']?.stringValue && !notes ? [currentNotesDataSample] : [])
    if (removedDataSamples.length) deleteDataSamples(removedDataSamples)

    const createdOrUpdatedDataSamples = (notes?.length && currentNotesDataSample?.content?.['en']?.stringValue !== notes ? [userNotesDataSample] : [])
      .concat([userPeriodDataSample])
      .concat(addedComplaints.map((item) => getUserComplaintDataSample(item.SNOMED_CT_CODE)))
    if (createdOrUpdatedDataSamples.length) createOrUpdateDataSamples(createdOrUpdatedDataSamples)

    onSave()
  }
  return (
    <View style={styles.container}>
      <View style={styles.popup}>
        {/* Header */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeIcnContainer}>
            <Image style={styles.closeIcn} source={require('../../assets/images/close.png')} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollableContainer}>
          <View style={styles.dataSamplesList}>
            {/* Period */}
            <View style={styles.flowDataSample}>
              <Text style={globalStyles.baseText}>Menstruation</Text>
              <View>
                <View style={styles.dataItemSubtitle}>
                  <View style={styles.dataItemIconContainer}>
                    <Image style={styles.dataItemIcn} source={require('../../assets/images/circle.png')} />
                  </View>
                  <Text style={globalStyles.baseText}>Period</Text>
                </View>
                <View style={styles.dataItemContentContainer}>
                  <Text style={globalStyles.baseText}>Flow level</Text>
                  <View style={styles.dataItemContent}>
                    <RadioButton initialData={radioButtonInitialValue} data={periodFlowLevelsData} onSelect={(value) => setSelectedFlowLevel(value)} />
                  </View>
                </View>
              </View>
            </View>

            {/* Complaints */}
            <View style={styles.complaintsDataSample}>
              <Text style={[globalStyles.baseText]}>How do you feel?</Text>
              <View>
                <View style={styles.dataItemSubtitle}>
                  <View style={styles.dataItemIconContainer}>
                    <Image style={styles.dataItemIcn} source={require('../../assets/images/triangle.png')} />
                  </View>
                  <Text style={globalStyles.baseText}>Complaints</Text>
                </View>
                <View style={styles.dataItemContentContainer}>
                  <View style={styles.dataItemContent}>
                    <CheckBox onPress={(value) => setCheckedComplaints(value)} data={checkedComplaints} />
                  </View>
                </View>
              </View>
            </View>

            {/* Notes */}
            <View style={styles.notesDataSample}>
              <Text style={globalStyles.baseText}>Notes</Text>
              <CustomInput value={notes} onChange={(value) => value && setNotes(value)} placeholder="e.g. Medication " />
            </View>
          </View>
          {/* ButtonsGroup */}
          <View style={styles.buttonsGroup}>
            <Button title="Delete" onClick={handleDelete} danger />
            <View style={styles.rightGroup}>
              <Button title="Cancel" onClick={handleClose} outlined />
              <Button title="Save" onClick={handleSave} />
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: WIDTH_MODAL,
    height: HEIGHT_MODAL,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  popup: {
    width: '100%',
    marginTop: HEIGHT_MODAL * 0.05,
    backgroundColor: '#FFFDFE',
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    paddingVertical: 32,
    marginBottom: 32,
    gap: 24,
  },
  scrollableContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 32,
  },
  dataSamplesList: {
    gap: 16,
  },
  flowDataSample: {
    gap: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 8,
  },
  title: {
    fontSize: 20,
    color: '#151B5D',
    fontFamily: 'Nunito-Medium',
  },
  closeIcnContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcn: {
    width: 16,
    height: 16,
  },
  dataItemSubtitle: {
    backgroundColor: '#F2F3FE',
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  dataItemIconContainer: {
    marginRight: 8,
  },
  dataItemIcn: {
    width: 15,
    height: 15,
  },
  dataItemContentContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F2F3FE',
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
    gap: 8,
  },
  dataItemContent: {
    paddingHorizontal: 8,
  },
  complaintsDataSample: {
    gap: 8,
  },
  notesDataSample: {
    gap: 8,
  },
  buttonsGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightGroup: {
    flexDirection: 'row',
    gap: 8,
  },
})
