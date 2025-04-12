

window.fieldmap = { 
    "OpenSolar": { //maps to OpenSolar data
        "customer": {
            "firstName": "contacts_data.0.first_name",
            "lastName": "contacts_data.0.family_name",
            "displayName": "contacts_data.0.display",
            "email": "contacts_data.0.email",
            "phone": "contacts_data.0.phone",
        },
        "job": {
            "siteName": "title",
            "address": "address",
            "countryName": "countryName",
        }
    },
    "Tradify": { //maps to Tradify fields
        "customer": {
            "displayName": "vm.customer.customerName",
            "email": "vm.customer.email",
            "mobile": "vm.customer.mobileNumber",
            "phone": "vm.customer.phoneNumber",
            "address": "vm.customer.physicalGeoAddress"
        },
        "job": {
            // project fields
            "siteName": "vm.model.locationName",
        }
    }
};

window.formMap = { //determine which form to use base on div present, for multiple (ie popups it will be chosen by last in list
    "#job-detail": "job",
    "#customer-detail": "customer"
};

window.tabList = [ //list of tabs to be used for autofill
    "info",
    "notes",
    "sites",
    "jobs",
    "recurringjobs",
    "servicereminders",
    "invoices",
    "recurringinvoices",
    "quotes"
]; 

window.buttonLocation = '.navbar-fixed-bottom.action-bar .pull-left'; //location of button to be injected