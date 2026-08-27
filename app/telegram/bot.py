class OperatorBot:
 """Production wiring placeholder; C1 deliberately never starts polling."""
 def __init__(self,operator_user_id,transport): self.operator_user_id,self.transport=operator_user_id,transport
 def authorized(self,user_id): return str(user_id)==str(self.operator_user_id)
