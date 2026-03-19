"""
Extract voting records from Ajax town council meeting minutes using Claude
"""
import os
import json
from typing import Any
from anthropic import Anthropic
from pydantic import BaseModel, Field

client = Anthropic()


class Vote(BaseModel):
    councillor_name: str = Field(description="Name of the councillor")
    position: str = Field(description="Vote position: 'for', 'against', or 'absent'")
    motion_title: str = Field(description="Title/description of the motion")
    motion_outcome: str = Field(description="Outcome: 'CARRIED' or 'DEFEATED'")


class MeetingMinutesExtractor:
    """Extract voting records from meeting minutes using Claude with vision"""

    def __init__(self, model: str = "claude-3-5-sonnet-20241022"):
        self.model = model
        self.conversation_history = []

    def extract_votes(self, minutes_text: str) -> list[dict[str, Any]]:
        """
        Extract voting records from meeting minutes text.
        Uses multi-turn conversation with Claude for context.
        """
        self.conversation_history = []

        # First turn: Send the minutes
        system_prompt = """You are an expert at extracting voting records from Canadian municipal council meeting minutes.

Your task is to:
1. Identify all motions/votes recorded
2. Extract which councillors voted for, against, or were absent
3. Note the outcome of each motion

Format each vote clearly with:
- Councillor name
- Their vote (for/against/absent)
- Motion title
- Motion outcome (carried/defeated)

Be thorough and accurate. If you're unsure about a detail, note it."""

        self.conversation_history.append(
            {
                "role": "user",
                "content": f"Please extract all voting records from these meeting minutes:\n\n{minutes_text}",
            }
        )

        response = client.messages.create(
            model=self.model,
            max_tokens=2048,
            system=system_prompt,
            messages=self.conversation_history,
        )

        assistant_message = response.content[0].text
        self.conversation_history.append({"role": "assistant", "content": assistant_message})

        # Second turn: Ask for JSON format
        self.conversation_history.append(
            {
                "role": "user",
                "content": "Now please provide all the votes you found in JSON format. For each vote include: councillor_name, position (for/against/absent), motion_title, and motion_outcome (CARRIED/DEFEATED).",
            }
        )

        response = client.messages.create(
            model=self.model,
            max_tokens=4096,
            system=system_prompt,
            messages=self.conversation_history,
        )

        json_text = response.content[0].text

        # Extract JSON from response
        try:
            # Try to find JSON array in the response
            if "```json" in json_text:
                json_str = json_text.split("```json")[1].split("```")[0].strip()
            elif "[" in json_text:
                json_str = json_text[json_text.find("[") : json_text.rfind("]") + 1]
            else:
                json_str = json_text

            votes = json.loads(json_str)
            return votes if isinstance(votes, list) else [votes]
        except json.JSONDecodeError:
            print(f"Error parsing JSON response: {json_text}")
            return []

    def ask_followup(self, question: str) -> str:
        """Ask a follow-up question to clarify voting records"""
        self.conversation_history.append({"role": "user", "content": question})

        response = client.messages.create(
            model=self.model,
            max_tokens=1024,
            messages=self.conversation_history,
        )

        answer = response.content[0].text
        self.conversation_history.append({"role": "assistant", "content": answer})
        return answer


if __name__ == "__main__":
    # Example: Extract votes from sample meeting minutes
    sample_minutes = """
    AJAX TOWN COUNCIL MEETING MINUTES
    October 25, 2024

    Present: Shaun Collier (Mayor), Marilyn Crawford, Sterling Lee, Joanne Dies,
    Rob Tyler-Morin, Nancy Henry, Lisa Bower

    MOTION 1: Approval of September Meeting Minutes
    Moved by: Marilyn Crawford
    Seconded by: Sterling Lee
    Vote: 7-0 in favour
    CARRIED

    MOTION 2: Approval of Q3 Budget Report
    Moved by: Rob Tyler-Morin
    Seconded by: Nancy Henry
    Vote:
    - Shaun Collier: FOR
    - Marilyn Crawford: FOR
    - Sterling Lee: FOR
    - Joanne Dies: AGAINST
    - Rob Tyler-Morin: FOR
    - Nancy Henry: FOR
    - Lisa Bower: FOR
    Result: 6-1 in favour
    CARRIED

    MOTION 3: Amendment to Zoning By-law for Downtown Development
    Moved by: Lisa Bower
    Seconded by: Joanne Dies
    Vote:
    - Shaun Collier: FOR
    - Marilyn Crawford: AGAINST
    - Sterling Lee: FOR
    - Joanne Dies: FOR
    - Rob Tyler-Morin: FOR
    - Nancy Henry: AGAINST
    - Lisa Bower: FOR
    Result: 5-2 in favour
    CARRIED
    """

    extractor = MeetingMinutesExtractor()
    print("Extracting votes from sample meeting minutes...")
    votes = extractor.extract_votes(sample_minutes)

    print(f"\nExtracted {len(votes)} votes:")
    print(json.dumps(votes, indent=2))
