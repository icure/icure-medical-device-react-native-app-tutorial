import React, { useState } from 'react'
import { ScrollView, StyleSheet, View, Dimensions, Text, Image, TouchableOpacity } from 'react-native'

import { globalStyles } from '../../styles/GlobalStyles'
import { MyInformationTab } from './MyInformationTab'
import { LogoutTab } from './LogoutTab'

const WIDTH_MODAL = Dimensions.get('window').width
const HEIGHT_MODAL = Dimensions.get('window').height

type EditUserDataModalProps = {
  onCancel: () => void
  onSave: () => void
  onShareWithDoctor: () => void
  onEditDoctor: () => void
}

export const EditUserDataModal: React.FC<EditUserDataModalProps> = ({ onCancel, onSave }) => {
  const [activeTab, setActiveTab] = useState('my-information')
  return (
    <View style={styles.container}>
      <View style={styles.popup}>
        {/* Header */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Manage account</Text>
          <TouchableOpacity onPress={onCancel} style={styles.closeIcnContainer}>
            <Image style={styles.closeIcn} source={require('../../assets/images/close.png')} />
          </TouchableOpacity>
        </View>
        {/* Tabs */}
        <ScrollView contentContainerStyle={styles.scrollableContainer}>
          <View style={[styles.tabsHeader]}>
            <View style={styles.tabsInnerContainer}>
              <TouchableOpacity style={[activeTab === 'my-information' && styles.activeTab]} onPress={() => setActiveTab('my-information')}>
                <Text style={[globalStyles.baseText, styles.tabTitle, activeTab === 'my-information' && styles.activeTabTitle]}>My information</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[activeTab === 'logout' && styles.activeTab]} onPress={() => setActiveTab('logout')}>
                <Text style={[globalStyles.baseText, styles.tabTitle, activeTab === 'logout' && styles.activeTabTitle]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>

          {activeTab === 'my-information' && <MyInformationTab onSave={onSave} onCancel={onCancel} />}
          {activeTab === 'logout' && <LogoutTab />}
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
    height: '100%',
    backgroundColor: '#FFFDFE',
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    paddingVertical: 32,
  },
  scrollableContainer: {
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexGrow: 1,
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
    fontFamily: 'Nunito-Medium',
    color: '#303443',
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
  tabsHeader: {
    width: '100%',
    height: 32,
    marginTop: 32,
    borderBottomColor: 'rgba(162,164,190, 0.4)',
    borderBottomWidth: 1,
  },
  tabsInnerContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -1,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    width: '100%',
  },
  tabTitle: {
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    paddingHorizontal: 4,
  },
  activeTab: {
    borderBottomColor: '#009290',
    borderBottomWidth: 1,
  },
  activeTabTitle: {
    color: '#009290',
    fontFamily: 'Nunito-Bold',
  },
})
