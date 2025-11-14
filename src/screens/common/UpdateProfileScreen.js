import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
  FlatList,
  Platform,
  StatusBar,
  SafeAreaView,
  Switch, // Import Switch component
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker'; //
import {
  User,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  FileText,
  Home,
  Percent,
  ImageIcon,
  ChevronDown,
  Building2,
  Save,
  RotateCcw,
  Tag, // For GST Rate icon
} from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

// Business Type Options
const BUSINESSES = [
  { label: 'Restaurant', value: 1 },
  { label: 'Grocery', value: 2 },
  { label: 'Retail', value: 3 },
  { label: 'Service', value: 4 },
  { label: 'Other', value: 5 },
];

// GST Registration Types
const GST_REGTYPES = [
  { label: 'Regular Taxpayer', value: 1 },
  { label: 'Composition Scheme', value: 2 },
  { label: 'Input Service Distributor (ISD)', value: 3 },
  { label: 'Casual Taxable Person', value: 4 },
  { label: 'Non-Resident Taxable Person', value: 5 },
  { label: 'E-Commerce Operator', value: 6 },
];

// GST Billing Options (renamed from GST_BILLING for clarity in UI logic)
const GST_BILLING_TYPES = [
  { label: 'Including GST', value: 2 }, // Tax values are added in the product’s price
  { label: 'Excluding GST', value: 3 }, // Tax value is added on the bill
  { label: 'No GST', value: 1 }, // Added for completeness, if 'Do you have GST?' is false, this is implicitly selected.
];

// Discount Base Options
const DISC_BASE = [
  { label: 'Before Tax', value: 1 },
  { label: 'After Tax', value: 2 },
];

// GST Rate Options
const GST_RATES = [
  { label: '5%', value: '5' },
  { label: '12%', value: '12' },
  { label: '18%', value: '18' },
  { label: '28%', value: '28' },
  { label: 'Other', value: 'Other' },
];

const fieldIcons = {
  ownerName: <User size={20} color="#FF6347" />,
  ownerMobile: <Phone size={20} color="#FF6347" />,
  ownerEmail: <Mail size={20} color="#FF6347" />,
  businessType: <Briefcase size={20} color="#FF6347" />,
  gstin: <FileText size={20} color="#FF6347" />,
  gstStateCode: <MapPin size={20} color="#FF6347" />,
  gstRegType: <Building2 size={20} color="#FF6347" />,
  panNo: <FileText size={20} color="#FF6347" />,
  tradeLicenseNo: <FileText size={20} color="#FF6347" />,
  shopName: <Home size={20} color="#FF6347" />,
  shopAddress: <MapPin size={20} color="#FF6347" />,
  billingMobile: <Phone size={20} color="#FF6347" />,
  gstBillingType: <Briefcase size={20} color="#FF6347" />, // Renamed from gstType
  gstRate: <Tag size={20} color="#FF6347" />, // New icon for GST Rate
  billDiscountBase: <Percent size={20} color="#FF6347" />,
  billDiscountRate: <Percent size={20} color="#FF6347" />,
};

export default function UpdateProfileScreen() {
  const { userId, userMobile } = useContext(AuthContext);
  const { t } = useLanguage(); // Assuming t function is for translations

  const [form, setForm] = useState({
    userId: userId || '',
    ownerName: '',
    ownerMobile: userMobile || '',
    ownerEmail: '',
    businessType: '',
    hasGst: false, // New field for GST toggle
    gstin: '',
    gstStateCode: '',
    gstRegType: '',
    gstBillingType: '', // Renamed from gstType
    gstRate: '', // New field for GST Rate selection
    customGstRate: '', // New field for custom GST rate when 'Other' is selected
    panNo: '',
    tradeLicenseNo: '',
    shopName: '',
    shopAddress: '', // Now optional
    billingMobile: '', // Now mandatory
    billDiscountBase: '', // Now optional
    billDiscountRate: '', // Conditionally mandatory
    logo: null,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [selectModal, setSelectModal] = useState({
    open: false,
    options: [],
    onChange: null,
    key: '',
    display: '',
  });

  const validate = () => {
    const e = {};
    if (!form.ownerName) e.ownerName = 'Owner Name is required';
    if (!form.ownerMobile || !/^\d{10,15}$/.test(form.ownerMobile))
      e.ownerMobile = 'Enter a valid mobile number (10-15 digits)';
    if (
      form.ownerEmail &&
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.ownerEmail)
    )
      e.ownerEmail = 'Invalid email format';
    if (!form.businessType) e.businessType = 'Select business type';
    if (!form.shopName) e.shopName = 'Shop name is required';
    if (!form.billingMobile || !/^\d{10,15}$/.test(form.billingMobile)) // Billing Mobile is now mandatory
      e.billingMobile = 'Billing Mobile Number is required and must be 10-15 digits';

    // GST Specific Validations
    if (form.hasGst) {
      if (!form.gstBillingType) e.gstBillingType = 'Select GST Billing Type';

      if (form.gstin && form.gstin.length !== 15)
        e.gstin = 'GSTIN must be 15 characters';

      // If 'Excluding GST' is selected, GST Rate is mandatory
      if (form.gstBillingType === 3) { // 3 is 'Excluding GST'
        if (!form.gstRate) {
          e.gstRate = 'GST Rate is required';
        } else if (form.gstRate === 'Other') {
          if (!form.customGstRate || isNaN(form.customGstRate) || parseFloat(form.customGstRate) < 0 || parseFloat(form.customGstRate) > 100) {
            e.customGstRate = 'Enter a valid custom GST rate (0-100)';
          }
        }
      }
    } else {
      // If hasGst is false, clear any GST related errors that might persist
      // and ensure GST-related fields are considered valid or ignored.
      // This is important if user toggles off GST after filling.
      // We don't need to explicitly clear form values here, as they won't be submitted
      // or validated if hasGst is false.
    }

    if (form.panNo && !/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(form.panNo))
      e.panNo = 'PAN should be 10 valid characters (e.g., ABCDE1234F)';

    // Discount Rate is mandatory if Discount Base is provided
    if (form.billDiscountBase) {
      if (
        !form.billDiscountRate ||
        isNaN(form.billDiscountRate) ||
        parseFloat(form.billDiscountRate) < 0 ||
        parseFloat(form.billDiscountRate) > 100
      )
        e.billDiscountRate = 'Discount Rate is required and should be between 0-100%';
    } else {
        // If billDiscountBase is not set, billDiscountRate is optional,
        // but if provided, it should still be valid.
        if (form.billDiscountRate && (isNaN(form.billDiscountRate) || parseFloat(form.billDiscountRate) < 0 || parseFloat(form.billDiscountRate) > 100)) {
            e.billDiscountRate = 'Discount Rate should be between 0-100%';
        }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const pickLogo = async () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxHeight: 400,
        maxWidth: 400,
        quality: 0.8,
        selectionLimit: 1,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          alert('ImagePicker Error: ' + response.errorMessage);
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          setForm({ ...form, logo: asset.uri });
        }
      }
    );
  };

  const handleChange = (k, v) => {
    setForm((prevForm) => {
      const newForm = { ...prevForm, [k]: v };

      // Reset GST-related fields if hasGst is toggled off
      if (k === 'hasGst' && v === false) {
        newForm.gstin = '';
        newForm.gstStateCode = '';
        newForm.gstRegType = '';
        newForm.gstBillingType = '';
        newForm.gstRate = '';
        newForm.customGstRate = '';
      }
      // Reset GST Rate and customGstRate if gstBillingType changes to something other than 'Excluding GST'
      if (k === 'gstBillingType' && v !== 3) { // 3 is 'Excluding GST'
          newForm.gstRate = '';
          newForm.customGstRate = '';
      }
      // Reset customGstRate if gstRate changes to something other than 'Other'
      if (k === 'gstRate' && v !== 'Other') {
          newForm.customGstRate = '';
      }
      return newForm;
    });
  };

  const handleSubmit = () => {
    if (validate()) {
      setSubmitting(true);
      setTimeout(() => {
        // Here you would typically send the form data to your backend
        alert('Profile Updated:\n' + JSON.stringify(form, null, 2));
        setSubmitting(false);
      }, 1000);
    }
  };

  const handleReset = () => {
    setForm((f) => ({
      ...f,
      ownerName: '',
      ownerMobile: userMobile || '',
      ownerEmail: '',
      businessType: '',
      hasGst: false,
      gstin: '',
      gstStateCode: '',
      gstRegType: '',
      gstBillingType: '',
      gstRate: '',
      customGstRate: '',
      panNo: '',
      tradeLicenseNo: '',
      shopName: '',
      shopAddress: '',
      billingMobile: '',
      billDiscountBase: '',
      billDiscountRate: '',
      logo: null,
    }));
    setErrors({});
  };

  const openSelect = (key, options, label) => {
    setSelectModal({
      open: true,
      options,
      key,
      onChange: (v) => {
        setSelectModal((modal) => ({ ...modal, open: false }));
        handleChange(key, v);
      },
      display: options.find((o) => o.value === form[key])?.label || '',
      title: label, // Pass label to modal for dynamic title
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* Header */}
        {/* Removed header as it was commented out in the original code,
            but can be added back if needed */}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Owner Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={20} color="#FF6347" strokeWidth={2} />
              <Text style={styles.sectionTitle}>Owner Details</Text>
            </View>
            <CustomInput
              label="Owner Name"
              value={form.ownerName}
              onChangeText={(v) => handleChange('ownerName', v)}
              icon={fieldIcons.ownerName}
              placeholder="Enter full name"
              error={errors.ownerName}
              required
            />
            <View style={styles.formRow}>
              <CustomInput
                label="Mobile Number"
                value={form.ownerMobile}
                onChangeText={(v) =>
                  handleChange('ownerMobile', v.replace(/[^0-9]/g, ''))
                }
                icon={fieldIcons.ownerMobile}
                keyboardType="phone-pad"
                maxLength={15}
                placeholder="10 digit number"
                error={errors.ownerMobile}
                half
                required
              />
              <CustomInput
                label="Email ID"
                value={form.ownerEmail}
                onChangeText={(v) => handleChange('ownerEmail', v)}
                icon={fieldIcons.ownerEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="email@example.com"
                error={errors.ownerEmail}
                half
              />
            </View>
          </View>

          {/* Business Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Briefcase size={20} color="#FF6347" strokeWidth={2} />
              <Text style={styles.sectionTitle}>Business & GST</Text>
            </View>
            <CustomSelect
              label="Business Type"
              value={form.businessType}
              onPress={() => openSelect('businessType', BUSINESSES, 'Select Business Type')}
              options={BUSINESSES}
              display={
                BUSINESSES.find((o) => o.value === form.businessType)?.label
              }
              icon={fieldIcons.businessType}
              error={errors.businessType}
              required
            />

            {/* Do you have GST? Toggle */}
            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.label}>Do you have GST?</Text>
                <Switch
                  trackColor={{ false: '#767577', true: '#FF6347' }}
                  thumbColor={form.hasGst ? '#F8F8F8' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={(v) => handleChange('hasGst', v)}
                  value={form.hasGst}
                />
              </View>
            </View>

            {form.hasGst && (
              <>
                <CustomSelect
                  label="GST Billing Type" // Renamed label
                  value={form.gstBillingType}
                  onPress={() => openSelect('gstBillingType', GST_BILLING_TYPES, 'Select GST Billing Type')}
                  options={GST_BILLING_TYPES}
                  display={
                    GST_BILLING_TYPES.find((o) => o.value === form.gstBillingType)?.label
                  }
                  icon={fieldIcons.gstBillingType}
                  error={errors.gstBillingType}
                  required // Mandatory if hasGst is true
                />
                {form.gstBillingType === 3 && ( // 3 is 'Excluding GST'
                  <>
                    <View style={styles.formRow}>
                        <CustomSelect
                            label="GST Rate"
                            value={form.gstRate}
                            onPress={() => openSelect('gstRate', GST_RATES, 'Select GST Rate')}
                            options={GST_RATES}
                            display={
                                GST_RATES.find((o) => o.value === form.gstRate)?.label
                            }
                            icon={fieldIcons.gstRate}
                            error={errors.gstRate}
                            half
                            required // Mandatory if Excluding GST is selected
                        />
                        {form.gstRate === 'Other' && (
                            <CustomInput
                                label="Custom GST Rate (%)"
                                value={form.customGstRate}
                                onChangeText={(v) => handleChange('customGstRate', v.replace(/[^0-9.]/g, ''))}
                                icon={fieldIcons.gstRate}
                                keyboardType="numeric"
                                placeholder="e.g. 10.5"
                                error={errors.customGstRate}
                                half
                                required // Mandatory if 'Other' is selected
                            />
                        )}
                    </View>
                  </>
                )}
                <View style={styles.formRow}>
                  <CustomInput
                    label="GSTIN Number"
                    value={form.gstin}
                    onChangeText={(v) => handleChange('gstin', v.toUpperCase())}
                    icon={fieldIcons.gstin}
                    maxLength={15}
                    placeholder="15 digit GSTIN"
                    autoCapitalize="characters"
                    error={errors.gstin}
                    half
                  />
                  <CustomInput
                    label="GST State Code"
                    value={form.gstStateCode}
                    onChangeText={(v) => handleChange('gstStateCode', v)}
                    icon={fieldIcons.gstStateCode}
                    placeholder="e.g. 22"
                    keyboardType="numeric"
                    half
                  />
                </View>
                <CustomSelect
                  label="GST Registration Type"
                  value={form.gstRegType}
                  onPress={() => openSelect('gstRegType', GST_REGTYPES, 'Select GST Registration Type')}
                  options={GST_REGTYPES}
                  display={
                    GST_REGTYPES.find((o) => o.value === form.gstRegType)?.label
                  }
                  icon={fieldIcons.gstRegType}
                />
              </>
            )}
            <View style={styles.formRow}>
              <CustomInput
                label="PAN Number"
                value={form.panNo}
                onChangeText={(v) => handleChange('panNo', v.toUpperCase())}
                icon={fieldIcons.panNo}
                maxLength={10}
                placeholder="ABCDE1234F"
                autoCapitalize="characters"
                error={errors.panNo}
                half
              />
              <CustomInput
                label="Trade License No."
                value={form.tradeLicenseNo}
                onChangeText={(v) => handleChange('tradeLicenseNo', v)}
                icon={fieldIcons.tradeLicenseNo}
                placeholder="License number"
                half
              />
            </View>
          </View>

          {/* Shop Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Home size={20} color="#FF6347" strokeWidth={2} />
              <Text style={styles.sectionTitle}>Shop Details</Text>
            </View>
            <CustomInput
              label="Shop Name"
              value={form.shopName}
              onChangeText={(v) => handleChange('shopName', v)}
              icon={fieldIcons.shopName}
              placeholder="Your shop name"
              error={errors.shopName}
              required
            />
            <CustomInput
              label="Shop Address"
              value={form.shopAddress}
              onChangeText={(v) => handleChange('shopAddress', v)}
              icon={fieldIcons.shopAddress}
              placeholder="Full address with city, pin"
              error={errors.shopAddress} // Still show error if invalid, but not for emptiness
              multiline
              textareaStyle={styles.textarea}
              // required removed as per new logic
            />
            <CustomInput
              label="Billing Mobile No."
              value={form.billingMobile}
              onChangeText={(v) =>
                handleChange('billingMobile', v.replace(/[^0-9]/g, ''))
              }
              icon={fieldIcons.billingMobile}
              placeholder="Billing contact numbers"
              keyboardType="phone-pad"
              maxLength={15}
              error={errors.billingMobile}
              required // Now mandatory
            />
            <View style={styles.formGroup}>
              <Text style={styles.label}>Shop Logo (Optional)</Text>
              <TouchableOpacity
                style={styles.logoPicker}
                onPress={pickLogo}
                activeOpacity={0.7}
              >
                <View style={styles.logoPickerContent}>
                  <ImageIcon size={24} color="#FF6347" strokeWidth={2} />
                  <Text style={styles.logoPickerText}>
                    {form.logo ? 'Change Logo' : 'Upload Logo'}
                  </Text>
                </View>
              </TouchableOpacity>
              {form.logo && (
                <View style={styles.logoPreviewContainer}>
                  <Image source={{ uri: form.logo }} style={styles.logoPreview} />
                </View>
              )}
            </View>
          </View>

          {/* Billing & Discount */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Percent size={20} color="#FF6347" strokeWidth={2} />
              <Text style={styles.sectionTitle}>Billing & Discount</Text>
            </View>
            <CustomSelect
              label="Bill Discount Base Price (Optional)"
              value={form.billDiscountBase}
              onPress={() => openSelect('billDiscountBase', DISC_BASE, 'Select Discount Base')}
              options={DISC_BASE}
              display={
                DISC_BASE.find((o) => o.value === form.billDiscountBase)
                  ?.label
              }
              icon={fieldIcons.billDiscountBase}
              error={errors.billDiscountBase}
              // required removed, now optional
            />
            <CustomInput
              label="Bill Discount Rate (Mandatory if Discount Base is set)"
              value={form.billDiscountRate}
              onChangeText={(v) =>
                handleChange('billDiscountRate', v.replace(/[^0-9.]/g, ''))
              }
              icon={fieldIcons.billDiscountRate}
              placeholder="0-100%"
              keyboardType="numeric"
              error={errors.billDiscountRate}
              // required removed, now conditional based on billDiscountBase
            />
          </View>

          {/* Error Box */}
          {Object.values(errors).length > 0 && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxTitle}>Please fix these errors:</Text>
              {Object.values(errors).map((e, i) => (
                <Text key={i} style={styles.errorText}>
                  • {e}
                </Text>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <RotateCcw size={18} color="#666666" strokeWidth={2} />
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, submitting && styles.saveButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Save size={18} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.saveButtonText}>
                {submitting ? 'Saving...' : 'Save Profile'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <SelectModal
        visible={selectModal.open}
        options={selectModal.options}
        value={form[selectModal.key]}
        onSelect={(v) => {
          selectModal.onChange && selectModal.onChange(v);
        }}
        onRequestClose={() => setSelectModal((m) => ({ ...m, open: false }))}
        title={selectModal.title || 'Select Option'} // Pass title to modal
      />
    </SafeAreaView>
  );
}

const CustomInput = ({
  label,
  value,
  onChangeText,
  icon,
  placeholder,
  error,
  keyboardType,
  maxLength,
  autoCapitalize,
  half,
  multiline,
  textareaStyle,
  required,
}) => (
  <View style={[styles.formGroup, half && styles.formGroupHalf]}>
    <Text style={styles.label}>
      {label}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
    <View
      style={[
        styles.inputBox,
        error && styles.inputBoxError,
        multiline && styles.inputBoxMultiline,
      ]}
    >
      {icon && <View style={styles.inputIconWrapper}>{icon}</View>}
      <TextInput
        style={[styles.input, multiline && textareaStyle]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        placeholderTextColor="#999999"
      />
    </View>
    {error && <Text style={styles.inputError}>{error}</Text>}
  </View>
);

const CustomSelect = ({
  label,
  value,
  onPress,
  options,
  display,
  icon,
  error,
  half,
  required,
}) => (
  <View style={[styles.formGroup, half && styles.formGroupHalf]}>
    <Text style={styles.label}>
      {label}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
    <TouchableOpacity
      onPress={onPress}
      style={[styles.inputBox, error && styles.inputBoxError]}
      activeOpacity={0.7}
    >
      {icon && <View style={styles.inputIconWrapper}>{icon}</View>}
      <Text style={[styles.selectText, !value && styles.selectPlaceholder]}>
        {display || 'Select...'}
      </Text>
      <ChevronDown size={18} color="#999999" strokeWidth={2} />
    </TouchableOpacity>
    {error && <Text style={styles.inputError}>{error}</Text>}
  </View>
);

const SelectModal = ({ visible, options, value, onSelect, onRequestClose, title }) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onRequestClose}
  >
    <View style={styles.modalBackdrop}>
      <View style={styles.modalSheet}>
        <View style={styles.modalHandle} />
        <Text style={styles.modalTitle}>{title}</Text>
        <FlatList
          data={options}
          keyExtractor={(o) => (o.value ? o.value.toString() : o.label)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.modalOption,
                value === item.value && styles.modalOptionSelected,
              ]}
              onPress={() => onSelect(item.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  value === item.value && styles.modalOptionTextSelected,
                ]}
              >
                {item.label}
              </Text>
              {value === item.value && (
                <View style={styles.modalCheckmark} />
              )}
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
        <TouchableOpacity
          style={styles.modalCancelButton}
          onPress={onRequestClose}
          activeOpacity={0.8}
        >
          <Text style={styles.modalCancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  formGroup: {
    marginBottom: 16,
  },
  formGroupHalf: {
    flex: 1,
    marginRight: 8,
  },
  formRow: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  required: {
    color: '#FF6347',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  inputBoxError: {
    borderColor: '#FF6347',
    borderWidth: 1.5,
  },
  inputBoxMultiline: {
    minHeight: 80,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  inputIconWrapper: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1C1C1C',
    padding: 0,
  },
  textarea: {
    textAlignVertical: 'top',
    minHeight: 60,
  },
  selectText: {
    flex: 1,
    fontSize: 15,
    color: '#1C1C1C',
  },
  selectPlaceholder: {
    color: '#999999',
  },
  inputError: {
    fontSize: 12,
    color: '#FF6347',
    marginTop: 4,
    marginLeft: 4,
  },
  logoPicker: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
    padding: 16,
  },
  logoPickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logoPickerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666666',
  },
  logoPreviewContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  logoPreview: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  errorBox: {
    backgroundColor: '#FFF5F5',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6347',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  errorBoxTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6347',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#CC0000',
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    height: 52,
    borderRadius: 10,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6347',
    height: 52,
    borderRadius: 10,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E8E8E8',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1C',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionSelected: {
    backgroundColor: '#FFF5F5',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '400',
  },
  modalOptionTextSelected: {
    color: '#FF6347',
    fontWeight: '600',
  },
  modalCheckmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6347',
  },
  modalCancelButton: {
    marginTop: 12,
    marginHorizontal: 20,
    backgroundColor: '#F8F8F8',
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
});