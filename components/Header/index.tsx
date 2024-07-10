import React, { useState } from 'react'
import { View, Image, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native'

import { EditUserDataModal } from '../ManageAccount'

export type Props = {
  userName: string
}

export const Header: React.FC<Props> = ({ userName }) => {
  const [editUserDataModalVisible, setEditUserDataModalVisible] = useState(false)

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.userName}>Hello, {userName}!</Text>
        <TouchableOpacity onPress={() => setEditUserDataModalVisible(true)}>
          <Image style={styles.userAvatar} source={require('../../assets/images/user-avatar.png')} />
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={editUserDataModalVisible}
        onRequestClose={() => {
          setEditUserDataModalVisible(!editUserDataModalVisible)
        }}
      >
        <EditUserDataModal
          onCancel={() => setEditUserDataModalVisible(!editUserDataModalVisible)}
          onSave={() => setEditUserDataModalVisible(!editUserDataModalVisible)}
          onShareWithDoctor={() => setEditUserDataModalVisible(!editUserDataModalVisible)}
          onEditDoctor={() => setEditUserDataModalVisible(!editUserDataModalVisible)}
        />
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F4F9',
  },
  userName: {
    fontSize: 16,
    color: '#303443',
    fontFamily: 'Nunito-Bold',
  },
  userAvatar: {
    width: 32,
    height: 32,
  },
})
