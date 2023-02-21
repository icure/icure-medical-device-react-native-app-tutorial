/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {ScrollView, StatusBar, Text, useColorScheme} from 'react-native';

import {Router} from './navigation/Router';
import {Provider} from 'react-redux';
import {persistor, store} from './redux/store';
import {PersistGate} from 'redux-persist/integration/react';
import 'react-native-get-random-values';

Buffer = require('@craftzdog/react-native-buffer').Buffer;

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    // backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    backgroundColor: '#FFFDFE',
    flex: 1,
  };

  console.log('store');
  console.log(store);

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={<Text>Loading...</Text>}>
        {/* <SafeAreaView style={backgroundStyle}> */}
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={backgroundStyle.backgroundColor} />
        <ScrollView contentInsetAdjustmentBehavior="automatic" style={backgroundStyle}>
          <Router />
        </ScrollView>
        {/* </SafeAreaView> */}
      </PersistGate>
    </Provider>
  );
};

export default App;
