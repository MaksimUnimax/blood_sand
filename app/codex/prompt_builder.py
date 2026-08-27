from pathlib import Path
class PromptBuilder:
 def __init__(self,prompts,reference_dir): self.prompts,self.reference_dir=Path(prompts),Path(reference_dir)
 def build(self,question):
  return '\n\n'.join([(self.prompts/'base.md').read_text(),(self.prompts/'references.md').read_text(),f"Q-ID: {question['public_id']}\nMarketplace: {question['marketplace']}\nProduct: {question.get('product_title') or ''}\nCustomer question (verbatim):\n{question['question_text']}"])
