// import React from "react";
// import { View } from "react-native";
// import {
//   makeStyles,
//   Text,
//   Button,
//   useThemeMode,
//   useTheme,
// } from "@rneui/themed";
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { useNavigation } from '@react-navigation/native';

// function MyTabBar1() {
//   const navigation = useNavigation();
//   return (
//     <Button
//       title="Go somewhere"
//       onPress={() => {
//         // Navigate using the `navigation` prop that you received
//         navigation.navigate('Settings');
//       }}
//     />
//   );
// }

// function MyTabBar2() {
//   const navigation = useNavigation();
//   return (
//     <Button
//       title="Go somewhere"
//       onPress={() => {
//         // Navigate using the `navigation` prop that you received
//         navigation.navigate("Profile");
//       }}
//     />
//   );
// }

// export default function App() {
//   const styles = useStyles();
//   const { setMode, mode } = useThemeMode();
//   const { theme } = useTheme();

//   const Tab = createBottomTabNavigator();

//   const handleOnPress = () => {
//     setMode(mode === "dark" ? "light" : "dark");
//   };

//   return (
//      <Tab.Navigator>
//       <Tab.Screen name="Profile" component={MyTabBar1} />
//       <Tab.Screen name="Settings" component={MyTabBar2} />
//     </Tab.Navigator>
//   );
// }

// const useStyles = makeStyles((theme) => ({
//   container: {
//     flex: 1,
//     backgroundColor: theme.colors.orange,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   text: {
//     marginVertical: theme.spacing.lg,
//   },
// }));
