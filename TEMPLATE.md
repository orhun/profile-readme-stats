Account age: **{{ ACCOUNT_AGE }}** years

Pushed **{{ COMMITS }}** commits (Longest Streak: **{{ LONGEST_COMMIT_STREAK }}** days, Current Streak: **{{ COMMIT_STREAK }}** days)

Opened **{{ ISSUES }}** issues

Submitted **{{ PULL_REQUESTS }}** pull requests

Reviewed **{{ CODE_REVIEWS }}** pull requests

Received **{{ STARS }}** stars

Followers: **{{ FOLLOWERS }}** | Following: **{{ FOLLOWING }}**

Sponsors: **{{ SPONSORS }}** | Sponsoring: **{{ SPONSORING }}**

Discussions Started: **{{ DISCUSSIONS_STARTED }}** | Answered: **{{ DISCUSSIONS_ANSWERED }}**

Own **{{ REPOSITORIES }}** repositories

Contributed to **{{ REPOSITORIES_CONTRIBUTED_TO }}** public repositories

**Recent Activity:**
{{ RECENT_ACTIVITY }}

Top 8 most used languages across your repositories:

{{ LANGUAGE_TEMPLATE_START }}
![{{LANGUAGE_NAME}}](https://img.shields.io/static/v1?style=flat-square&label=%E2%A0%80&color=555&labelColor={{LANGUAGE_COLOR:uri}}&message={{LANGUAGE_NAME:uri}}%EF%B8%B1{{LANGUAGE_PERCENT:uri}}%25)
{{ LANGUAGE_TEMPLATE_END }}
