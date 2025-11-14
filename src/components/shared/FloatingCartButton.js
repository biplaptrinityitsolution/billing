import React, { useContext, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { ShoppingCart } from 'lucide-react-native';
import { BillingContext } from '../../context/BillingContext';

export default function FloatingCartButton() {
  const navigation = useNavigation();
  const { cart } = useContext(BillingContext);
  const isOnCart = useNavigationState((state) => {
    const getDeepestRouteName = (navState) => {
      const route = navState?.routes?.[navState.index];
      if (!route) return undefined;
      if (route.state) return getDeepestRouteName(route.state);
      return route.name;
    };
    return getDeepestRouteName(state) === 'Cart';
  });

  const itemCount = useMemo(() => cart.reduce((sum, i) => sum + (i.quantity || 0), 0), [cart]);

  if (!cart || cart.length === 0) return null;
  if (isOnCart) return null;

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={() => {
          // Navigate via root stack to nested tab + stack route
          // Root has 'Main' → tabs include 'Billing' → BillingStack has 'Cart'
          try {
            navigation.navigate('Main', { screen: 'Billing', params: { screen: 'Cart' } });
          } catch (e) {
            // Fallbacks for different navigator contexts
            try { navigation.navigate('Billing', { screen: 'Cart' }); } catch (e2) {}
            try { navigation.navigate('Cart'); } catch (e3) {}
          }
        }}
      >
        <ShoppingCart size={18} color="#fff" style={{ marginRight: 7 }} />
        <Text style={styles.text}>Bill({itemCount})</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // Lift above the floating bottom tab bar height (~70) with extra gap
    bottom:150,
    left: 18,
    zIndex: 9999,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C3E50',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 7,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.2,
  },
});


