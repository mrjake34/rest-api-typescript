export enum statusCodes {
    //success codes
    Ok = 200,
    Created = 201,
    //client error codes
    BadRequest = 400,
    Unauthorized = 401,
    PaymentRequired = 402,
    Forbidden = 403,
    NotFound = 404,
    NotAcceptable = 406,
    //server error codes
    InternalServerError = 500
}

export enum statusMessages {
    //success messages
    RegisterSuccess = 'Register process completed successfully',
    CreateSuccess = 'Create process completed successfully',
    UpdateSuccess = 'Update process completed successfully',
    DeleteSuccess = 'Delete process completed successfully',
    DetailsSuccess = 'Detail process completed successfully',
    LoginSuccess = 'Login process completed successfully',
    ListSuccess = 'Item listed successfuly',

    //failed messages
    RegisterFailed = 'Register process completed with an error',
    UpdateFailed = 'Update process completed with an error',
    DeleteFailed = 'Delete process completed with an error',
    DetailsFailed = 'Detail process completed with an error',
    LoginFailed = 'Login process completed with an error',

    InputsNotFilled = 'Inputs must be filled',
    InputsNotFilledOrTypesWrong = 'Inputs must be filled or check input types',

    UserNotFound = 'User not found',
    UserIdFailed = 'Wrong UserId',
    CourierNotFound = 'Courier not found',
    EmailFailed = 'Email is already in use',
    ShopNameFailed = 'ShopName is already in use',
    PhoneFailed = 'Phone is already in use',
    ProductNameFailed = 'Product name already in use',
    ProductNotFound = 'Product not found',
    OrderNotFound = 'Order not found',
    CustomerNotFound = 'Customer not found',

    Unauthorized = 'Unauthorized'
}
