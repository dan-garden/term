function determine() {
    const string = `
    
	- AgreementController.php
	- ApirequestlimitController.php
	- AutoswipebalanceController.php
	- BulkreissueController.php
	- BulkrevokeController.php
	- BulkswitchController.php
	- ComodostatusController.php
	- CurrencyController.php
	- DailysalesController.php
	- DeletepkeyController.php
	- EncpkeyController.php
	- FulfillmentController.php
	- LeadreminderController.php
	- MigrationController.php
	- OldapisalesController.php
	- OrdersavedreminderController.php
	- OverdraftreminderController.php
	- PasswordupdateController.php
	- PaymentreminderController.php
	- PendingvreminderController.php
	- PriceupdateController.php
	- QueryController.php
	- RenewalremindercheckerController.php
	- RenewalreminderController.php
	- ResellerrenewalreminderController.php
	- ResellerpasswordController.php
	- ResubmitqueuedorderController.php
	- SealdbsyncController.php
	- SendqueuedsmsController.php
	- SymantecstatusController.php
----
	- agreement
	- apirequestlimit
	- autoswipebalance
	- comodostatus
	- currency
	- dailysales
	- deletepkey
	- leadreminder
	- oldapisales
	- ordersavedreminder
	- overdraftreminder
	- paymentreminder
	- pendingvreminder
	- priceupdate
	- renewalreminder
	- renewalreminderchecker
	- resellerrenewalreminder
	- resubmitqueuedorder
	- sealdbsync
	- sendqueuedsms
	- symantecstatus
    `;
    
    
    const [files, cron] = string.split("----").map(c => c.trim()).map(c => {
        let list = c.split("\n").map(o => {
            o = o.replace("Controller.php", "").toLowerCase();
            return o.replace("- ", "").trim();
        });
        
        return list;
    });
    
    const missing = files.filter(f => (cron.indexOf(f) < 0));
    const result = {
        files: files.map(c => ucfirst(c) + "Controller.php"),
        cron,
        missing,
        commands: files.map(c => "/usr/local/bin/php /var/www/framework.trustico.com/yii "+c)
    };
    
    return result;
}


window.det = determine();