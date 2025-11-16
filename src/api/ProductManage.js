import AsyncStorage from '@react-native-async-storage/async-storage';

export const getCategoryDetails = async (userID) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw { message: 'Unauthorized: No token provided', code: 401 };
    }

    console.log(token,userID);

    const myHeaders = new Headers();
    myHeaders.append("accept", "*/*");
    myHeaders.append("Authorization", `Bearer ${token}`);

    console.log("headers", myHeaders)

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    const response = await fetch(
      `http://103.150.136.204/EBillingRestAPI/api/v1/user/getCategoryDtls?userID=${userID}`,
      requestOptions
    );

    console.log("resp", response)

    if (response.status === 401) {
      throw { message: 'Unauthorized: No token provided', code: 401 };
    }

    if (!response.ok) {
      throw { message: 'Failed to get Categories List' };
    }

    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getProductsByUserId = async (userID) => {


  const token = await AsyncStorage.getItem('userToken');

  const myHeaders = new Headers();
  myHeaders.append('accept', '*/*');
  myHeaders.append("Authorization", `Bearer ${token}`);

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
  };

  try {
    if (!token) {
      throw { message: 'Unauthorized: No token provided', code: 401 };
    }

    const response = await fetch(
      `http://103.150.136.204/EBillingRestAPI/api/v1/user/getProductsByUserId?userID=${userID}`,
      requestOptions
    );

    console.log(response)



    if (response?.status === 401) {
      throw { message: 'Unauthorized: No token provided', code: 401 };
    }

    if (!response.ok) {
      throw { message: 'Failed to get Products List',};
    }

    const result = await response.json();

    console.log("resultpro",result);

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const saveCategory = async ({
  category_id = 0,
  category_name,
  category_description = '',
  user_id,
}) => {
  const token = await AsyncStorage.getItem('userToken');

  const myHeaders = new Headers();
  myHeaders.append('accept', '*/*');
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('Authorization', token);

  const body = JSON.stringify({
    category_id,
    category_name,
    category_description,
    user_id,
  });

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: body,
    redirect: 'follow',
  };

  try {
    if (!token) {
      throw { message: 'Unauthorized: No token provided', code: 401 };
    }

    const response = await fetch(
      'http://103.150.136.204/EBillingRestAPI/api/v1/user/saveCategory',
      requestOptions
    );
    if (response?.status === 401) {
      throw { message: 'Unauthorized: No token provided', code: 401 };
    }

    if (!response.ok) {
      throw { message: 'Failed to save category'};
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Save product to API
export const saveProduct = async ({
  product_id = 0,
  category_id,
  product_name,
  product_unit,
  product_tax,
  hsn_sac = '',
  product_price,
  quantity = 0,
  product_image = '',
  user_id,
}) => {
  const token = await AsyncStorage.getItem('userToken');

  const myHeaders = new Headers();
  myHeaders.append('accept', '*/*');
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('Authorization', token);

  const body = JSON.stringify({
    product_id,
    category_id,
    product_name,
    product_unit,
    product_tax,
    hsn_sac,
    product_price,
    quantity,
    product_image,
    user_id,
  });

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: body,
    redirect: 'follow',
  };

  try {
    if (!token) {
      throw { message: 'Unauthorized: No token provided', code: 401 };
    }

    const response = await fetch(
      'http://103.150.136.204/EBillingRestAPI/api/v1/user/saveProduct',
      requestOptions
    );
    if (response?.status === 401) {
      throw { message: 'Unauthorized: No token provided', code: 401 };
    }

    if (!response.ok) {
      throw { message: 'Failed to save product' };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};





