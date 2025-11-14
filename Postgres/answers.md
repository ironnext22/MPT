classDiagram
direction BT
class answers {
   bigint submission_id
   bigint question_id
   bigint option_id
   text answer_text
   timestamp with time zone created_at
   bigint id
}
class forms {
   bigint creator_id
   text title
   timestamp with time zone created_at
   bigint id
}
class options {
   bigint question_id
   text option_text
   boolean is_correct
   integer position
   timestamp with time zone created_at
   bigint id
}
class questions {
   bigint form_id
   text question_text
   forms.ans_type ans_kind
   boolean is_required
   integer position
   timestamp with time zone created_at
   bigint id
}
class respondents {
   citext email
   text name
   text locale
   boolean gdpr_consent
   jsonb meta
   timestamp with time zone created_at
   bigint id
}
class submissions {
   bigint form_id
   bigint respondent_id
   bigint respondent_user_id
   uuid access_token
   timestamp with time zone started_at
   timestamp with time zone submitted_at
   bigint id
}
class users {
   citext username
   text password
   citext email
   timestamp with time zone created_at
   bigint id
}

answers  -->  options : option_id:id
answers  -->  questions : question_id:id
answers  -->  submissions : submission_id:id
forms  -->  users : creator_id:id
options  -->  questions : question_id:id
questions  -->  forms : form_id:id
submissions  -->  forms : form_id:id
submissions  -->  respondents : respondent_id:id
submissions  -->  users : respondent_user_id:id
