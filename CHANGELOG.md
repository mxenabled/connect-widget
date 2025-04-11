# Changelog

## v.0.9.5

### Updated

- Verify Existing Member screen to only show members whose institutions support the requested products.

## v.0.9.3

### Added

- Adding a UCP specific variable to the connection success event

## v.0.9.2

### Added

- Adding a github workflow for tagging and linting

## v.0.9.1

### Added

- Adding github workflows for a new publishing process

## v.0.9.0

### Added

- Product validations when loading connect.

### Fixed

- Connect success survey open ended input style

## v.0.8.0

### Fixed

- VerifyExistingMember step to not show held/client-managed members.
- Updated packages to resolve vulnerabilities.

## v.0.7.0

### Added

- Ability to use Analytics provider's survey feature.

## v.0.6.2

### Fixed

- A bug with the body text truncating on WaitingForOAuth.

## v.0.6.1

### Fixed

- A bug with the color of the focus indicator on the favorite institution view.

## v.0.6.0

### Updated

- All typography now uses MXUI instead of Kyper.

## v.0.5.3

### Fixed

- UserFeatures prop to be an array.

## v.0.5.2

### Changed

- `ClientLogo` now has a default background of white for transparent components.

## v.0.5.1

### Changed

- Don't try to access the job_type if there is no recent job

## v.0.5.0

### Updated

- `ConnectLogoHeader` component now uses @kyper/mui `InstitutionLogo`. Now displays a custom logo_url field if present on an institution. Connected event now includes an aggregator property if provided.

## v.0.4.3

### Changed

- Republish

## v.0.4.2

### Changed

- Fix a race condition bug where the Connecting screen would not move on when the member is Connected.

## v.0.4.1

### Changed

- Now focusing the container around the back button instead of the back button on step changes to preserve a good UX for people with and without screen readers

## v.0.4.0

### Updated

- `InstitutionBlock` component now uses @kyper/mui `InstitutionLogo`. Now displays a custom logo_url field if present on an institution

## v.0.3.0

### Added

- Focus indicator to searched institution results
- Focus to the VerifyExistingMember page header when it loads

## Updated

- `RECONNECTED` member connection status from a login error status to a processing status
- Fixed a Manual Account Honeybadger

## v.0.2.0

### Updated

- `InstitutionTile` component now uses @kyper/mui `InstitutionLogo`. Now displays a custom logo_url field if present on an institution

## v.0.1.0

### Updated

- `InstitutionGridTile` component now uses @kyper/mui `InstitutionLogo`. Now displays a custom logo_url field if present on an institution

## v.0.0.21

### Changed

- A bug with selecting an institution.

## v.0.0.20

### Changed

- Added support for iso_country_code

## v.0.0.19

### Changed

- Prevent OAuth flows from adding accounts onto the wrong member.

## v.0.0.18

### Changed

- Updated copy on the connected screen/view

## v.0.0.17

### Changed

- Input on MFA view to be full width instead of half width per design.

## v.0.0.16

### Changed

- The translation script and updated translation files
- Updated the copy on the Connected screen/view

## v.0.0.15

### Changed

- Moved where the state for the day picker is set and read
- Hides global navigation header on the day picker view

## v0.0.14

### Changed

- Convert `ui_message_version` to integer if it comes through as a string.

## v0.0.13

### Changed

- Don't show back button on search when heavy disclosure is on.
- Always show back button when interstitial Disclosure is rendered.
- Fixed Manual Account HoneyBadger.

## v0.0.12

### Changed

- Fixed issues with `TextFields` refactor.

## v0.0.11

### Changed

- Connected screen now has new UI.

## v0.0.10

### Updated

- `Inputs` components from Kyper to `TextFields` components from KMUI.

## v0.0.9

### Removed

- Unused ComponentStack slice from redux.

## v0.0.8

### Changed

- Nav GoBack button receives focus on step change.
- Updated MX cookie policy link.
- Updated buttons to MUI buttons.
- Light disclosure is no longer behind experiment. Just profile flags.

### Removed

- All experiments.

## v0.0.7

### Changed

- Fix Manual Account

## v0.0.6

### Changed

- Global Nav header to show for everyone
- Fixed the layout of the heavy disclosure

## v0.0.5

### Added or Changed

- Republish of package

## v0.0.4

### Added or Changed

- Changelog markdown to project for all future changes.
- Updated linking instructions on README.
- Allows members to have use cases.
