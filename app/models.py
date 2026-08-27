from dataclasses import dataclass
@dataclass(frozen=True)
class QuestionIdentity: id:int; public_id:str; marketplace:str; external_question_id:str
