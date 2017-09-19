/*

Max Hegler @ 2017
- Get Module_Notify_* functions

*/

/* --------------- Define Dependencies --------------- */
var fse = require('fs-extra');
var path = require('path');

/* --------------- Define Global Variables --------------- */
var lsk = (process.env.HOME + '/Documents/Merchant-9/');

/* --------------- Define Functions --------------- */
var output = function(array) {
	return array.reduce(function(str, fn) {
		return str + fn.replace(/[\(\")]/g, '') + "\n";
	}, '');
};
var parseFile = function(file) {
	var pathinfo = path.parse(file);
	var pattern = new RegExp('(Module_Notify_.*?)[\(\"]+', 'g');
	if (pathinfo.ext === '.mv') {
		var contents = fse.readFileSync(file);
		var matches = contents.toString().match(pattern);

		if (matches) {
			console.log( output(matches) );
		}
	}
};
var parseDirectory = function(dir) {
	fse.walk(dir).on('data', function(item) {
		parseFile(item.path);
	});
};

/* --------------- Run --------------- */
parseDirectory(lsk);


/*

not_cust, not_digital, not_giftcert, not_seo, not_subscript, not_order, not_cat, not_fields, not_image, not_ordershpmnt, not_orderitem, not_orderreturn, not_prod

*/

/*

Module_Notify_Order_BatchChange
Module_Notify_Customer_Insert
Module_Notify_Customer_Update
Module_Notify_Customer_Delete
Module_Notify_DigitalDownload_Created
Module_Notify_DigitalDownload_Deleted
Module_Notify_GiftCertificate_Created
Module_Notify_GiftCertificate_Updated
Module_Notify_GiftCertificate_Deleted
Module_Notify_GiftCertificate_Redeemed
Module_Notify_Payment_AuthorizationFailure
Module_Notify_SEOSettings
Module_Notify_Subscription_Created
Module_Notify_Subscription_Changed
Module_Notify_Subscription_Deleted
Module_Notify_Category_Insert
Module_Notify_Category_Update
Module_Notify_Category_Delete
Module_Notify_StandardFields
Module_Notify_Image_Delete
Module_Notify_Image_Insert
Module_Notify_Order_Delete
Module_Notify_Order_Insert
Module_Notify_Order_StatusChange
Module_Notify_OrderShipment_Insert
Module_Notify_OrderItem_StatusChange
Module_Notify_OrderItem_Delete
Module_Notify_OrderReturn_Insert
Module_Notify_OrderShipment_StatusChange
Module_Notify_OrderReturn_StatusChange
Module_Notify_OrderReturn_Delete
Module_Notify_OrderItem_Insert
Module_Notify_OrderItem_Update
Module_Notify_OrderShipment_Delete
Module_Notify_Product_Insert
Module_Notify_Product_Update
Module_Notify_Product_Delete

*/