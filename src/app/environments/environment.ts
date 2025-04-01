// environment.ts

const baseUrl = 'http://localhost:8080/api/v1';
const authUrl = 'http://localhost:8080/api';
const shippingUrl = 'http://localhost:8080/api/shipping';
const cloudinaryUrl = 'http://localhost:8080/api';
const voucherUrl = cloudinaryUrl;
export const environment = {
  production: false,

  apiUrl: baseUrl,
  apiAuthUrl: authUrl,
  apiShippingUrl: shippingUrl,
  apiCloudinaryUrl: cloudinaryUrl,
  apiVoucherUrl: voucherUrl,  // ✅ Đúng baseUrl


  API_URLS: {
    // Tham chiếu trực tiếp các biến đã định nghĩa ở trên
    BASE_URL: baseUrl,
    AUTH_URL: authUrl,
    SHIPPING_URL: shippingUrl,
    CLOUDINARY_URL: cloudinaryUrl,

    STATISTICS: {
      TOTAL_REVENUE: `${baseUrl}/statistics/total-revenue`,
      TOTAL_ORDERS: `${baseUrl}/statistics/total-orders`,
      TOP_PRODUCTS: `${baseUrl}/statistics/top-products`,
    },

    REPORTS: {
      REVENUE: `${baseUrl}/reports/revenue`,
      MONTHLY_REVENUE: `${baseUrl}/reports/revenue/monthly`,
    },
    
    REVIEWS: {
      GET_BY_PRODUCT: (productId: number) => `${baseUrl}/reviews/product/${productId}`,
      GET_BY_USER: (userId: number) => `${baseUrl}/reviews/user/${userId}`,
      CREATE: `${baseUrl}/reviews`,
      UPDATE: (reviewId: number) => `${baseUrl}/reviews/${reviewId}`,
      DELETE: (reviewId: number) => `${baseUrl}/reviews/${reviewId}`,
    },

    REVIEW_REPLIES: {
      GET_ALL: `${baseUrl}/review-replies`,
      GET_BY_ID: (replyId: number) => `${baseUrl}/review-replies/${replyId}`,
      CREATE: `${baseUrl}/review-replies`,
      // Sửa lại đúng endpoint: /api/v1/review-replies/review/{reviewId}
      GET_BY_REVIEW: (reviewId: number) => `${baseUrl}/review-replies/review/${reviewId}`,
      UPDATE: (replyId: number) => `${baseUrl}/review-replies/${replyId}`,
      DELETE: (replyId: number) => `${baseUrl}/review-replies/${replyId}`,
    },

    AUTH: {
      LOGIN: `${authUrl}/auth/login`,
      REGISTER: `${authUrl}/auth/register`,
      REQUEST_OTP: `${authUrl}/auth/request-otp`,
      VERIFY_OTP: `${authUrl}/auth/verify-otp`,
      RESET_PASSWORD: `${authUrl}/auth/reset-password`,
      REFRESH_TOKEN: `${authUrl}/auth/refresh`,
    },
    ROLES: {
      GET_ALL: `${baseUrl}/roles`,
      GET_BY_ID: (id: number) => `${baseUrl}/roles/${id}`,
      CREATE: `${baseUrl}/roles`,
      UPDATE: (id: number) => `${baseUrl}/roles/${id}`,
      DELETE: (id: number) => `${baseUrl}/roles/${id}`,
    },

    USERS: {
      GET_ALL: `${baseUrl}/users`,
      GET_BY_ID: (id: number) => `${baseUrl}/users/${id}`,
      REGISTER: `${baseUrl}/users/register`,
      UPDATE_PROFILE: (id: number) => `${baseUrl}/users/${id}/profile`,
      UPDATE: (id: number) => `${baseUrl}/users/${id}`,
      DELETE: (id: number) => `${baseUrl}/users/${id}`,
      UPLOAD_AVATAR: `${baseUrl}/users/upload-avatar`,
      UPDATE_AVATAR: (id: number) => `${baseUrl}/users/${id}/avatar`,
      GET_ROLES: `${baseUrl}/users/roles`,
    },

    USER_ADDRESSES: {
    
      GET_ALL_BY_USER: (userId: number) => `${baseUrl}/user-addresses/user/${userId}`,
      GET_BY_ID: (addressId: number) => `${baseUrl}/user-addresses/${addressId}`,
      CREATE: `${baseUrl}/user-addresses`, 
      UPDATE: (addressId: number) => `${baseUrl}/user-addresses/${addressId}`, 
      DELETE: (addressId: number) => `${baseUrl}/user-addresses/${addressId}`,
    },

    BRANDS: {
      GET_ALL: `${baseUrl}/brands`,
      CREATE: `${baseUrl}/brands`,
      UPDATE: (id: number) => `${baseUrl}/brands/${id}`,
      DELETE: (id: number) => `${baseUrl}/brands/${id}`,
    },

    CART: {
      GET_CART: (userId: number) => `${baseUrl}/cart/${userId}`,
      ADD_ITEM: (userId: number) => `${baseUrl}/cart/${userId}`,
      UPDATE_ITEM: (userId: number) => `${baseUrl}/cart/${userId}`,
      REMOVE_ITEM: (cartItemId: number) => `${baseUrl}/cart/${cartItemId}`,
      CART_COUNT: (userId: number) => `${baseUrl}/cart/count/${userId}`,
    },

    CATEGORY: {
      GET_ALL: `${baseUrl}/categories`,
      CREATE: `${baseUrl}/categories`,
      UPDATE: (id: number) => `${baseUrl}/categories/${id}`,
      DELETE: (id: number) => `${baseUrl}/categories/${id}`,
      SEARCH: (keyword: string) => `${baseUrl}/categories/search?keyword=${keyword}`,
    },

    ORDER: {
      GET_ALL: `${baseUrl}/orders`,
      GET_BY_ID: (orderId: number) => `${baseUrl}/orders/${orderId}`,
      UPDATE_STATUS: (orderId: number, status: string) =>
        `${baseUrl}/orders/${orderId}/status?status=${status}`,
      DELETE: (orderId: number) => `${baseUrl}/orders/${orderId}`,

      CHECKOUT: (userId: number, addressId: number, shipMethodId: number, voucherCode?: string) =>
        `${baseUrl}/orders/${userId}/checkout?addressId=${addressId}&shipMethodId=${shipMethodId}${
          voucherCode ? `&voucherCode=${voucherCode}` : ""
        }`,

      GET_ORDERS_BY_USER: (userId: number) => `${baseUrl}/orders/user/${userId}`,
      MAIL: (orderId: number) => `${baseUrl}/orders/${orderId}/sendMail`,
    },

    ORDER_ITEM: {
      GET_BY_ORDER: (orderId: number) => `${baseUrl}/order-items/order/${orderId}`,
    },

    PAYMENT_HISTORY: {
      GET_ALL: `${baseUrl}/payments-history/all`,
      GET_BY_USER: (userId: number) => `${baseUrl}/payments-history/user/${userId}/payment-history`,
      DELETE: (historyId: number) => `${baseUrl}/payments-history/${historyId}`,
    },

    PAYMENT_METHODS: {
      GET_ALL: `${baseUrl}/payment-methods`,
      GET_BY_ID: (id: number) => `${baseUrl}/payment-methods/${id}`,
      CREATE: `${baseUrl}/payment-methods`,
      UPDATE: (id: number) => `${baseUrl}/payment-methods/${id}`,
      DELETE: (id: number) => `${baseUrl}/payment-methods/${id}`,
    },

    PAYMENTS: {
      BASE: `${baseUrl}/payments`,
      CREATE: (orderId: number, methodCode: string) =>
        `${baseUrl}/payments/${orderId}/pay?methodCode=${methodCode}`,
      CHECK_STATUS: `${baseUrl}/payments/callback`,
      GET_ALL: `${baseUrl}/payments`,
      GET_BY_ORDER: (orderId: number) => `${baseUrl}/payments/order/${orderId}`,
    },

    PRODUCT_IMAGES: {
      GET_ALL: (productId: number) => `${baseUrl}/product_images/${productId}`,
      CREATE: `${baseUrl}/product_images`,
      UPDATE: (imageId: number) => `${baseUrl}/product_images/${imageId}`,
      DELETE: (imageId: number) => `${baseUrl}/product_images/${imageId}`,
      IMPORT_EXCEL: `${baseUrl}/product_images/import-excel` ,
      TEMPLATE: `${baseUrl}/product_images/template`, // ✅ API lấy file template
    },

    PRODUCT_VARIANTS: {
      GET_ALL: (productId: number) => `${baseUrl}/product_variants/${productId}`,
      BRAND: (variantId: number) => `${baseUrl}/product_variants/${variantId}/brand`,
      VARIANT: (variantId: number) => `${baseUrl}/product_variants/variant/${variantId}`,
      CREATE: `${baseUrl}/product_variants`,
      UPDATE: (variantId: number) => `${baseUrl}/product_variants/${variantId}`,
      DELETE: (variantId: number) => `${baseUrl}/product_variants/${variantId}`,

      IMPORT_EXCEL: `${baseUrl}/product_variants/import-excel` ,
      TEMPLATE: `${baseUrl}/product_variants/template`, // ✅ API lấy file template
    },


    PRODUCTS: {
      GET_ALL: `${baseUrl}/products`,
      SEARCH: (keyword: string) => `${baseUrl}/products/search?keyword=${keyword}`,
      GET_BY_ID: (id: number) => `${baseUrl}/products/${id}`,
      GET_BY_IDS: `${baseUrl}/products/by-ids`, // ✅ API mới
      GET_BY_CATEGORY: (categoryId: number) => `${baseUrl}/products/category/${categoryId}`,
      CREATE: `${baseUrl}/products`,
      UPDATE: (id: number) => `${baseUrl}/products/${id}`,
      DELETE: (id: number) => `${baseUrl}/products/${id}`,
      IMPORT_EXCEL: `${baseUrl}/products/import-excel` ,
      TEMPLATE: `${baseUrl}/products/template`, // ✅ API lấy file template
    },
    SHIPPING: {
      METHODS: `${shippingUrl}/methods`,
    },

    CLOUDINARY: {
      UPLOAD_PRODUCT: `${cloudinaryUrl}/cloudinary/upload-product`,
      UPLOAD_LOGO: `${cloudinaryUrl}/cloudinary/upload-logo-brand`,
      UPLOAD_FOLDER: `${cloudinaryUrl}/cloudinary/upload-folder`, // ✅ Thêm API upload thư mục
    },


    // ✅ Cập nhật API VOUCHER để sử dụng baseUrl đúng
    VOUCHER: {
      GET_ALL: `${voucherUrl}/vouchers`,
      GET_BY_CODE: (voucherCode: string) => `${voucherUrl}/vouchers/${voucherCode}`, // ✅ Đúng URL
      CREATE: `${voucherUrl}/vouchers`,
      UPDATE: (voucherId: number) => `${voucherUrl}/vouchers/${voucherId}`,
      DELETE: (voucherId: number) => `${voucherUrl}/vouchers/${voucherId}`,
    },

    // ✅ API cho Favorite Products (Sản phẩm yêu thích)
    FAVORITES: {
      BASE: `${baseUrl}/favorites`,
      ADD: (userId: number, productId: number) => `${baseUrl}/favorites?userId=${userId}&productId=${productId}`,
      REMOVE: (userId: number, productId: number) => `${baseUrl}/favorites?userId=${userId}&productId=${productId}`,
      GET_USER_FAVORITES: (userId: number) => `${baseUrl}/favorites/${userId}`,
    },

  
  },
};
