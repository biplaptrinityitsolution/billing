  // src/navigation/BillingStack.js
  import React from 'react';
  import { createNativeStackNavigator } from '@react-navigation/native-stack';
  import BillingScreen from '../screens/employee/BillingScreen';
  import NewBillScreen from '../screens/billing/NewBillScreen';
  import CartScreen from '../screens/billing/CartScreen';
  import ProductsScreen from '../screens/employee/ProductsScreen';
  import BillsListScreen from '../screens/billing/BillsListScreen';
  import EditBillScreen from '../screens/billing/EditBillScreen';

  const Stack = createNativeStackNavigator();

  export default function BillingStack() {
    return (
      <Stack.Navigator initialRouteName="Products" screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="Products" 
          component={ProductsScreen}
          listeners={({ navigation }) => ({
            focus: () => {
              // Show tab bar for Products screen
              navigation.getParent()?.setOptions({
                tabBarStyle: {
                  position: 'absolute',
                  left: 18,
                  right: 18,
                  bottom: 18,
                  borderRadius: 38,
                  backgroundColor: 'rgba(38,50,56,0.68)',
                  borderWidth: 1,
                  borderColor: 'rgba(200,200,200,0.06)',
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.14,
                  shadowRadius: 20,
                  elevation: 12,
                  borderTopWidth: 0,
                  zIndex: 18,
                  overflow: 'hidden',
                  height: 70,
                  paddingBottom:0,
                  paddingTop: 10,
                  marginLeft: 6,
                  marginRight: 6,
                  paddingLeft: 6,
                  paddingRight: 6,
                }
              });
            }
          })}
        />
        <Stack.Screen name="BillingMain" component={BillingScreen} />
        <Stack.Screen name="NewBill" component={NewBillScreen} />
        <Stack.Screen 
          name="Cart" 
          component={CartScreen}
          listeners={({ navigation }) => ({
            focus: () => {
              // Hide tab bar for Cart screen
              navigation.getParent()?.setOptions({
                tabBarStyle: { display: 'none' }
              });
            },
            blur: () => {
              // Show tab bar when leaving Cart screen
              navigation.getParent()?.setOptions({
                tabBarStyle: {
                  position: 'absolute',
                  left: 18,
                  right: 18,
                  bottom: 18,
                  borderRadius: 38,
                  backgroundColor: 'rgba(38,50,56,0.68)',
                  borderWidth: 1,
                  borderColor: 'rgba(200,200,200,0.06)',
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.14,
                  shadowRadius: 20,
                  elevation: 12,
                  borderTopWidth: 0,
                  zIndex: 18,
                  overflow: 'hidden',
                  height: 70,
                  paddingBottom: 16,
                  paddingTop: 10,
                  marginLeft: 6,
                  marginRight: 6,
                  paddingLeft: 6,
                  paddingRight: 6,
                }
              });
            }
          })}
        />
        <Stack.Screen name="BillsList" component={BillsListScreen} />
        <Stack.Screen name="EditBill" component={EditBillScreen} />
      </Stack.Navigator>
    );
  }