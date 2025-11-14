// src/components/shared/CustomInput.js
import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Ensure react-native-vector-icons is installed

const CustomInput = ({
  label,
  iconName,
  error,
  password, // Special prop to handle password visibility toggle
  onFocus = () => {},
  ...props // All other TextInput props
}) => {
  const [focused, setFocused] = React.useState(false);
  const [hidePassword, setHidePassword] = React.useState(password); // Starts hidden if 'password' prop is true

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error
              ? 'red' // Red border for error
              : focused
              ? '#007bff' // Primary color when focused
              : '#ddd', // Default border color
          },
        ]}
      >
        {iconName && (
          <Icon
            name={iconName}
            style={styles.icon}
            color={error ? 'red' : focused ? '#007bff' : '#ccc'}
          />
        )}
        <TextInput
          style={styles.inputField}
          autoCorrect={false}
          onFocus={() => {
            onFocus(); // Call any external onFocus handler
            setFocused(true);
          }}
          onBlur={() => setFocused(false)}
          secureTextEntry={hidePassword} // Apply secureTextEntry based on hidePassword state
          placeholderTextColor="#B0B0B0" // Consistent placeholder color
          {...props}
        />
        {password && ( // Only show eye icon if 'password' prop is true
          <Icon
            onPress={() => setHidePassword(!hidePassword)}
            name={hidePassword ? 'eye-off-outline' : 'eye-outline'}
            style={styles.eyeIcon}
            color="#ccc"
          />
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20, // Space below each input group
    width: '100%',
  },
  label: {
    marginVertical: 5,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  inputContainer: {
    height: 50,
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000', // Basic shadow for modern look
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  icon: {
    fontSize: 22,
    marginRight: 10,
  },
  inputField: {
    color: '#333',
    flex: 1, // Allows text input to take remaining width
    fontSize: 16,
  },
  eyeIcon: {
    fontSize: 22,
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    paddingLeft: 5,
  },
});

export default CustomInput;