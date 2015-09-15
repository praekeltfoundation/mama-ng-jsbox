
```
@startuml
scale 900 width

[*] --> state_ur00


state_ur00: Welcome to Hello Mama! Please enter your unique personnel code. (e.g. 12345)
state_ur00: *VALIDATION: Valid number
state_ur00: *Error: Sorry, that is not a valid number. Please enter your unique personnel code. For example, 12345.
state_ur00 --> state_ur01


state_ur01: Please enter the mobile number of the person who will receive the weekly messages. (e.g. 0803304899)
state_ur01: *VALIDATION: Valid number
state_ur01: *Error: Sorry, that is not a valid number. Please enter the mobile number of the person who will receive the weekly messages. For example 0803304899
state_ur01 --> state_ur03


state_ur03: Please select who will receive the messages on their phone:
state_ur03: 1. The mother
state_ur03: 2. The father
state_ur03: 4. Family member
state_ur03: 5. Trusted friend
state_ur03 --> state_ur04


state_ur04: Please select one of the following:
state_ur04: 1. The mother is pregnant
state_ur04: 2. The mother has a baby under 1 year old]
state_ur04 --> state_ur06_LMP_month : 1
state_ur04 --> state_ur05_birth_month : 2


state_ur05_birth_month: Select the month & year the  baby was born:
state_ur05_birth_month: COMPONENT: Month_Year selector
state_ur05_birth_month --> state_ur05_birth_day


state_ur05_birth_day: What day of the month was the baby born? For example, 12.
state_ur05_birth_day: VALIDATION: state_ur05_birth_month
state_ur05_birth_day --> state_ur09_language


state_ur06_LMP_month: Please select the month the woman had her last period:
state_ur06_LMP_month: 1. August 15
state_ur06_LMP_month: 2. July 15
state_ur06_LMP_month: 3. June 15
state_ur06_LMP_month: ...
state_ur06_LMP_month --> state_ur08_LMP_day


state_ur08_LMP_day: What day of the month did the woman start her last period. (e.g. 12)
state_ur08_LMP_day: *VALIDATION: state_ur06_LMP_month
state_ur08_LMP_day --> state_ur09_language


state_ur09_language: What language would this person like to receive these messages in?
state_ur09_language: 1. English
state_ur09_language: 2. Hausa
state_ur09_language: 3. Igbo
state_ur09_language --> state_ur10_message

state_ur10_message: How would this person like to get messages?
state_ur10_message: 1. SMS
state_ur10_message: 2. Voice
state_ur10_message --> state_ur11_voice_days : 1
state_ur10_message --> state_ur14_confirm_message : 2


state_ur11_voice_days: We send messages twice a week. On what days would the person like to receive messages?
state_ur11_voice_days: 1. Monday and Wednesday
state_ur11_voice_days: 2. Tuesday and Thursday
state_ur11_voice_days --> state_ur12_voice_times


state_ur12_voice_times: Thank you. At what time would  they like to receive messages?
state_ur12_voice_times: 1. Between 9-11am
state_ur12_voice_times: 2. Between 2-5pm
state_ur12_voice_times --> state_ur13_confirm_voice


state_ur13_confirm_voice: Thank you. The person  will now start receiving messages on [day] and [day] between [time].
state_ur13_confirm_voice --> state_ur15_activate


state_ur14_confirm_message: Thank you. The person will now start receiving messages.
state_ur14_confirm_message --> state_ur15_activate


state_ur15_activate: If: state_ur04 1: Thank you. The person will now start receiving messages.
state_ur15_activate: If: state_ur04 2: Welcome to Hello MAMA. Unfortunately we do not yet have baby content but you will start to receive these messages as soon as they become available.


state_ur15_activate --> [*]

@enduml
```
