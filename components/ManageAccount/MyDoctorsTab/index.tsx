import { globalStyles } from '../../../styles/GlobalStyles'
import { StyleSheet, Text, View } from 'react-native'
import { SearchSquareInput } from '../../FormElements'
import { DoctorToBeAddedCard, DoctorToBeRemovedCard } from '../DoctorsCards'
import React, { useState } from 'react'
import { useFilterHealthcareProfessionalsQuery } from '../../../services/healthcareProfessionalApi'
import { useAppSelector } from '../../../redux/hooks'
import { createSelector } from '@reduxjs/toolkit'
import { MedTechApiState } from '../../../services/api'
import { CustomActivityIndicator } from '../../CustomActivityIndicator'

const reduxSelector = createSelector(
  (state: { medTechApi: MedTechApiState }) => state.medTechApi,
  (medTechApi: MedTechApiState) => ({
    user: medTechApi.user,
  }),
)
export const MyDoctorsTab = () => {
  const [isSearchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined)
  const { data: hcpListSearchResult, isFetching: isHcpSearchFetching } = useFilterHealthcareProfessionalsQuery({ name: searchQuery ?? '' }, { skip: !searchQuery })
  const { user } = useAppSelector(reduxSelector)

  const hcpListWithAccess = user?.sharingDataWith?.['medicalInformation']

  const filteredHcpList = hcpListSearchResult?.filter((item) => item.id && !hcpListWithAccess?.includes(item.id))
  return (
    <>
      {isHcpSearchFetching && <CustomActivityIndicator />}
      <View style={styles.tab}>
        <View style={styles.header}>
          <Text style={styles.title}>Share Your Medical Data with Your Doctor</Text>
          <Text style={styles.subtitle}>Find your doctor and securely share your period tracking data to receive personalized medical advice:</Text>
        </View>
        <View style={styles.searchContainer}>
          <SearchSquareInput
            onSubmit={(value?: string) => {
              setSearchQuery(value)
            }}
            onClose={() => {
              setSearchOpen(false)
              setSearchQuery(undefined)
            }}
            onOpen={() => setSearchOpen(true)}
            placeholder="Search for the doctor by name"
            searchQuery={searchQuery}
            onSearchQueryChange={(newValue) => setSearchQuery(newValue)}
          />
          {!isHcpSearchFetching && searchQuery && filteredHcpList?.length === 0 && (
            <View style={styles.noSearchResultContainer}>
              <Text style={styles.noSearchResultText}>
                We could not find any doctor with the name: `<Text style={{ fontWeight: '700' }}>{searchQuery}</Text>`.
              </Text>
              <Text style={[styles.noSearchResultText, globalStyles.mt4]}>Please, change the search query and try again.</Text>
            </View>
          )}
          {searchQuery &&
            filteredHcpList?.map(
              (item, index) =>
                item.id && (
                  <DoctorToBeAddedCard
                    onAdd={() => {
                      setSearchQuery(undefined)
                      setSearchOpen(false)
                    }}
                    key={index}
                    hcp={item}
                  />
                ),
            )}
        </View>
        {!isSearchOpen && (
          <View style={styles.doctorsList}>
            {hcpListWithAccess?.length ? (
              hcpListWithAccess.map((item, index) => <DoctorToBeRemovedCard key={index} id={item} />)
            ) : (
              <View style={styles.noSearchResultContainer}>
                <Text style={styles.noSearchResultText}>To share your medical information with a doctor, please use the search feature to find and add them.</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  tab: {
    flexGrow: 1,
    paddingVertical: 20,
    gap: 16,
    position: 'relative',
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#151B5D',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#A2A4BE',
  },
  searchContainer: {
    position: 'relative',
    gap: 8,
  },
  doctorsList: {
    gap: 8,
  },
  noSearchResultContainer: {
    flex: 1,
    paddingVertical: 24,
    backgroundColor: 'rgba(242, 243, 254, 0.6)',
    borderRadius: 10,
    paddingLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSearchResultText: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    textAlign: 'center',
    color: '#151B5D',
  },
})
