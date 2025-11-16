import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveUserProfileApi = async (data) => {

    const token = await AsyncStorage.getItem('userToken');



    // const payload1 = {
    //     user_id: userId || form.userId || 0,
    //     owner_name: form.ownerName,
    //     owner_mobile: form.ownerMobile,
    //     owner_email: form.ownerEmail,
    //     business_type: form.businessType,
    //     has_gst: form.hasGst, // if API expects this, or omit if not needed
    //     gstin: form.gstin,
    //     gst_state_code: form.gstStateCode,
    //     gst_reg_type: form.gstRegType,
    //     gst_billing_type: form.gstBillingType,
    //     gst_rate: form.gstRate,
    //     custom_gst_rate: form.customGstRate,
    //     pan_no: form.panNo,
    //     trade_license_no: form.tradeLicenseNo,
    //     shop_name: form.shopName,
    //     shop_address: form.shopAddress,
    //     billing_mobile: form.billingMobile,
    //     bill_discount_base: form.billDiscountBase,
    //     bill_discount_rate: form.billDiscountRate,
    //     logo: form.logo,
    //   };
 
  const payload = {
    user_id: data.user_id ?? 0,
    owner_name: data.owner_name ?? data.ownerName ?? '',
    owner_mobile: data.owner_mobile ?? data.ownerMobile ?? '',
    owner_email: data.owner_email ?? data.ownerEmail ?? '',
    business_type: data.business_type ?? data.businessType ?? 0,
    gstin: data.gstin ?? '',
    gst_state_code: data.gst_state_code ?? data.gstStateCode ?? '',
    gst_reg_type: data.gst_reg_type ?? data.gstRegType ?? 0,
    pan_no: data.pan_no ?? data.panNo ?? '',
    trade_license_no: data.trade_license_no ?? data.tradeLicenseNo ?? '',
    shop_name: data.shop_name ?? data.shopName ?? '',
    shop_address: data.shop_address ?? data.shopAddress ?? '',
    billing_mobile: data.billing_mobile ?? data.billingMobile ?? '',
    gst_type: data.gstBillingType ?? "",
    gst_tax_rate: data.gstRate ?? data.gstTaxRate ?? 0,
    bill_discount_base: data.bill_discount_base ?? data.billDiscountBase ?? 0,
    bill_discount_rate: data.bill_discount_rate ?? data.billDiscountRate ?? 0,
    logo: data.logo ?? '',
  };

  try {

    if (!token) {
      throw { message: 'Unauthorized: No token provided', code: 401 };
    }

    const response = await fetch(
      'http://103.150.136.204/EBillingRestAPI/user/saveUserProfile',
      {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.status === 401) {
        throw { message: 'Unauthorized: No token provided', code: 401 };
    }

    if (!response.ok) {
        throw{ message: 'Failed to save user profile', ...result };
    }

    const result = await response.json();

    console.log("resuly",result)

    // On success, API returns JSON
    return result;
  } catch (error) {
    throw error;
  }
};


