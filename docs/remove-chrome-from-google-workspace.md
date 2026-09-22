# Remove Chrome from Google Workspace

**Change reference:** `LX8F-43TH`

Google Workspace can remove a Chrome browser from Chrome Browser Cloud Management, but that action does **not** uninstall the Chrome application from a Windows or macOS computer. Choose the operation that matches the intended result below.

## Remove a managed-browser record

Use this when Chrome should no longer appear in the Google Admin console:

1. Sign in to [admin.google.com](https://admin.google.com/) with an account that has Chrome management privileges.
2. Go to **Devices > Chrome > Managed browsers**.
3. Search for the device, user, machine name, or browser ID.
4. Select the intended browser. Verify its machine name, last activity, and organizational unit before continuing.
5. Choose **Delete selected browsers** (or **Delete**, depending on the current console layout) and confirm.
6. Search for the browser again and record the result against change reference `LX8F-43TH`.

Deleting the inventory record does not remove the browser binary. A browser that still has a valid cloud-management enrollment token can enroll again and reappear.

## Prevent the browser from enrolling again

If the organization uses enrollment tokens, remove the token from the affected endpoint or from the endpoint-management policy that deploys it. If a token is no longer needed anywhere, revoke or delete it in **Devices > Chrome > Managed browsers > Enrollment**.

Treat enrollment tokens as credentials: do not paste one into this repository, a ticket, or an uninstall command. Removing a token from the Admin console does not uninstall Chrome from computers.

## Uninstall the Chrome application

Google Workspace's managed-browser inventory is not a software-deployment system. To remove the application itself, use the organization's endpoint-management product (for example, its Windows MDM/RMM or macOS MDM) and the vendor-supported uninstall workflow. After the endpoint uninstall finishes, remove any remaining managed-browser record using the first procedure.

Before an endpoint uninstall, decide separately whether user profile data should be retained. Removing profile data can delete local bookmarks, history, extensions, and unsynchronized user data.

## ChromeOS devices

Do not use an application-uninstall workflow for a ChromeOS device: Chrome is part of ChromeOS. If the goal is to remove the device from the organization, use the Admin console's ChromeOS device **deprovision** workflow instead, selecting the reason that accurately describes the device's disposition.

## Completion checklist

- Confirm the correct browser or device was selected.
- Confirm the managed-browser record no longer appears, if record deletion was requested.
- Confirm the enrollment mechanism was removed, if re-enrollment must be prevented.
- Confirm the endpoint-management uninstall succeeded, if application removal was requested.
- Record the outcome and timestamp under change reference `LX8F-43TH`.
