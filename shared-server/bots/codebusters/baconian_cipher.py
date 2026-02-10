import random
from .constants import BACONIAN_CODES

# Groups of visually similar characters - no two from the same group should be paired
_SIMILAR_GROUPS = [
    set("Il|1!"),   # vertical strokes
    set("0OoQ"),    # round shapes
    set("S5$"),     # S-like
    set("B8"),      # B-like
    set("G6"),      # G-like
    set("Z2"),      # Z-like
    set("'`"),      # quotes
    set("({["),     # open brackets
    set(")}]"),     # close brackets
    set(";:"),      # dots
    set(".,"),      # low dots
    set("-~"),      # dashes
]


def _are_visually_similar(a, b):
    """Check if two characters could be confused for each other"""
    for group in _SIMILAR_GROUPS:
        if a in group and b in group:
            return True
    return False


def generate_baconian():
    """Generate a Baconian cipher problem"""
    temp = bin(int(random.random() * 24))
    temp = temp[2:]
    char = ""
    n1 = chr(int(random.random() * 93) + 33)
    n2 = chr(int(random.random() * 93) + 33)
    while n2 == n1 or _are_visually_similar(n1, n2):
        n2 = chr(int(random.random() * 93) + 33)

    for n in range(5 - len(temp)):
        char += "0"
    char += temp

    weird = ""
    for letter in char:
        if letter == "0":
            weird += n1
        else:
            weird += n2

    return {
        "type": "baconian",
        "problem": weird,
        "question": f"What is the character for {weird}?",
        "answer": BACONIAN_CODES[char],
        "encoding": weird,
        "binary": char,
        "char_0": n1,
        "char_1": n2,
        "legend": f"{n1} is 0, {n2} is 1"
    }


def check_baconian(binary, user_answer):
    """Check answer for Baconian cipher"""
    try:
        if not isinstance(user_answer, str) or len(user_answer) == 0:
            raise ValueError("Answer must be a non-empty string")

        correct_answer = BACONIAN_CODES.get(binary, "")
        user_lower = user_answer.lower()

        correct = user_lower in correct_answer.split(',')

        return {
            "correct": correct,
            "user_answer": user_answer,
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError, AttributeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }
