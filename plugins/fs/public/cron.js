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
	- agreement=At 01:00
	- apirequestlimit=At 00:01
	- autoswipebalance=At 06:00
	- comodostatus=At every 5th minute
	- currency=At 01:00
	- dailysales=At 03:00
	- deletepkey=At 13:00
	- leadreminder=At every 60th minute
	- oldapisales=At 12:00 on Monday
	- ordersavedreminder=At every 5th minute
	- overdraftreminder=At 03:00 on day-of-month 1
	- paymentreminder=At 02:00
	- pendingvreminder=At 02:00
	- priceupdate=At 02:00
	- renewalreminder=At 01:00
	- renewalreminderchecker=At 13:00
	- resellerrenewalreminder=At 01:00 on day-of-month 1
	- resubmitqueuedorder=At every minute
	- sealdbsync=At every 10th minute
	- sendqueuedsms=At every 30th minute
	- symantecstatus=At every 5th minute
    `;
    
    const split = string.split("----");
    
    const files = split[0].trim().split("\n").map(o => {
        o = o.replace("Controller.php", "").toLowerCase();
        return o.replace("- ", "").trim();
    });
    
    
    const cronTimes = [];
    const cron = split[1].trim().split("\n").map((o,i) => {
        const line = o.replace("- ", "").trim();
        const splitter = line.split("=");
        cronTimes[i] = splitter[1];
        return splitter[0];
    });
    
    const missing = files.filter(f => (cron.indexOf(f) < 0));
    const result = {
        files: files.map(c => ucfirst(c) + "Controller.php"),
        cron,
        missing,
        commands: files.map((c,i) => "/usr/local/bin/php /var/www/framework.trustico.com/yii "+c + (cronTimes[i]?" > " + cronTimes[i]:""))
    };
    
    return result;
}

try {
    window.det = determine();
} catch(e) {
    console.error(e);
}