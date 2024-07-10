import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useAppDispatch } from '../../../redux/hooks'
import { useNavigate } from 'react-router-native'
import { logout } from '../../../services/api'
import { routes } from '../../../navigation/Routes'

export const LogoutTab = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate(routes.login)
  }
  return (
    <View style={[styles.tab]}>
      <Text style={[styles.description]}>If you are absolutely sure that you want to logout, please click the button below:</Text>
      <TouchableOpacity onPress={handleLogout} style={iconButton.container}>
        <Image style={iconButton.icon} source={require('../../../assets/images/logout.png')} />
        <Text style={iconButton.text}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  tab: {
    flexGrow: 1,
    paddingVertical: 20,
    gap: 16,
  },
  description: {
    width: '100%',
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#303443',
  },
})

const iconButton = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#009290',
  },
  icon: {
    width: 18,
    height: 18,
  },
  text: {
    color: '#303443',
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
  },
})
