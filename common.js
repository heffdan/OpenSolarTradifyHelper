

window.fieldmap = { 
    "OpenSolar": { //maps to OpenSolar data
        "customer": {
            "firstName": "contacts_data.0.first_name",
            "lastName": "contacts_data.0.family_name",
            "displayName": "contacts_data.0.display",
            "email": "contacts_data.0.email",
            "phone": "contacts_data.0.phone",
            "address": "address", //The address from opensolar is at the root field on the api so added it here (rather than from below job section)
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

window.btnElement = {
    OpenSolar: { //button to be injected for OpenSolar
        "location": 'div:has(button[aria-label="Activity"])', //location of button to be injected
        "id":'export-button', //id of button to be injected
        "title": 'Export to Tradify', //text of button to be injected
        "className": 'OSUI-ButtonBase-root OSUI-ButtonBase-sizeMedium OSUI-ButtonBase-colorPrimary OSUI-ButtonBase-variantSquared css-1g2t3k4', //class of button to be injected
        "textContent": '',
        "svg": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width="20" height="20"><defs><style>.cls-1 { fill: #009bc5; } .cls-2 { fill: none; }</style></defs><path class="cls-2" d="M0,0H150V150H0V0Z"></path><polygon class="cls-1" points="19.03 42.34 19.03 49.16 59.08 49.16 59.08 138.19 101.62 138.19 101.62 49.16 128.52 49.16 128.52 15.06 46.43 15.06 19.03 42.34"></polygon></svg>'
    },
    Tradify: { //button to be injected for Tradify
        "location": '.navbar-fixed-bottom.action-bar .pull-left', //location of button to be injected
        "id":'import-button', //id of button to be injected
        "title": 'Import from OpenSolar', //text of button to be injected
        "className": 'btn btn-black ng-binding ng-scope', //class of button to be injected
        "textContent": 'Import from OpenSolar', //content of button to be injected
        "svg": ''
    }
};


  