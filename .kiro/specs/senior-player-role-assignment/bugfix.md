# Bugfix Requirements Document

## Introduction

When creating a new staff account with the role "Senior Player", the account is successfully created but the role is incorrectly set to "coach" instead of "senior_player" in the profiles table. This causes the UI to display "Coach" instead of "Senior Player", and may prevent the permission system from functioning correctly for senior player accounts. The bug affects all senior player account creations and has persisted through multiple fix attempts.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN creating a staff account with role "senior_player" via the `admin_create_staff_user` database function THEN the system creates the account but stores role as "coach" in the profiles table

1.2 WHEN viewing a senior player account in the Profile screen or User Management interface THEN the system displays "Coach" instead of "Senior Player"

1.3 WHEN a senior player account is created THEN the system may apply incorrect permissions because the role field does not match "senior_player"

### Expected Behavior (Correct)

2.1 WHEN creating a staff account with role "senior_player" via the `admin_create_staff_user` database function THEN the system SHALL create the account with role "senior_player" stored in the profiles table

2.2 WHEN viewing a senior player account in the Profile screen or User Management interface THEN the system SHALL display "Senior Player" matching the actual role

2.3 WHEN a senior player account is created with permissions THEN the system SHALL create a user_permissions record and apply the correct permissions based on the "senior_player" role

### Unchanged Behavior (Regression Prevention)

3.1 WHEN creating a staff account with role "coach" THEN the system SHALL CONTINUE TO create the account with role "coach" in the profiles table

3.2 WHEN creating a staff account with role "captain" THEN the system SHALL CONTINUE TO create the account with role "captain" in the profiles table

3.3 WHEN creating any staff account THEN the system SHALL CONTINUE TO use temporary password "000000" and mark the account as requiring password change

3.4 WHEN creating any staff account THEN the system SHALL CONTINUE TO create both the auth.users record and corresponding profiles record

3.5 WHEN viewing coach or captain accounts in the UI THEN the system SHALL CONTINUE TO display "Coach" or "Captain" correctly

3.6 WHEN senior player permissions are specified during account creation THEN the system SHALL CONTINUE TO create the user_permissions record with the specified permissions
