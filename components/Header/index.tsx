import React, {useState} from 'react';
import {View, Image, Text, StyleSheet, TouchableOpacity} from 'react-native';

export type Props = {
  userName: string;
};

export const Header: React.FC<Props> = ({userName}) => {
  const [_, setEditUserDataModalVisible] = useState(false);

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.userName}>Hi, {userName}!</Text>
        <TouchableOpacity onPress={() => setEditUserDataModalVisible(true)}>
          <Image style={styles.userAvatar} source={require('../../assets/images/user-avatar.png')} />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  userName: {
    fontWeight: '700',
    fontSize: 20,
    color: '#151B5D',
    fontFamily: 'Nunito',
  },
  userAvatar: {
    width: 32,
    height: 32,
  },
});
