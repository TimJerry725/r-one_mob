import React from 'react';
import { useColorScheme, StatusBar, StyleSheet, Text, View } from 'react-native';
import { PaperProvider, MD3LightTheme, MD3DarkTheme, Button, Appbar, Surface } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const LightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6750A4',
    secondary: '#625B71',
    tertiary: '#7D5260',
  },
};

const DarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#D0BCFF',
    secondary: '#CCC2DC',
    tertiary: '#EFB8C8',
  },
};

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const theme = isDarkMode ? DarkTheme : LightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <Surface style={styles.container} elevation={0}>
          <Appbar.Header>
            <Appbar.Content title="Charger Assets" />
            <Appbar.Action icon="calendar" onPress={() => {}} />
            <Appbar.Action icon="magnify" onPress={() => {}} />
          </Appbar.Header>

          <View style={styles.content}>
            <Text style={[styles.text, { color: theme.colors.onSurface }]}>
              Welcome to Charger Asset Management System
            </Text>
            <Button 
              mode="contained" 
              onPress={() => console.log('Pressed')}
              style={styles.button}
            >
              Get Started
            </Button>
          </View>
        </Surface>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 18,
  },
  button: {
    marginTop: 8,
  },
});

export default App;
