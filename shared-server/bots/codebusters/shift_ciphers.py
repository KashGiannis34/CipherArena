import random


def generate_shift_letter():
    """Generate a letter shift problem"""
    number = int(random.random() * 26) + 65
    letter = chr(number)
    shift = int(random.random() * 26) + 1
    answer = chr(((number - 65 + shift) % 26) + 65)
    return {
        "type": "shift_letter",
        "problem": f"Shift {letter} by {shift}",
        "question": f"What is the letter when {letter} is shifted {shift} times?",
        "answer": answer,
        "letter": letter,
        "shift": shift
    }


def check_shift_letter(letter, shift, user_answer):
    """Check answer for letter shift"""
    try:
        if not isinstance(user_answer, str) or len(user_answer) == 0:
            raise ValueError("Answer must be a non-empty string")
        number = ord(letter.upper())
        correct_answer = chr(((number - 65 + shift) % 26) + 65)
        return {
            "correct": user_answer.upper() == correct_answer,
            "user_answer": user_answer.upper(),
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError, AttributeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }


def generate_shift_word():
    """Generate a word shift problem"""
    length = int(random.random() * 4) + 4
    word = ""
    for n in range(length):
        number = int(random.random() * 26) + 65
        word += chr(number)
    shift = int(random.random() * 26) + 1
    answer = ""
    for n in range(length):
        answer += chr(((ord(word[n]) - 65 + shift) % 26) + 65)
    return {
        "type": "shift_word",
        "problem": f"Shift {word} by {shift}",
        "question": f"What is the \"word\" when {word} is shifted {shift} times?",
        "answer": answer,
        "word": word,
        "shift": shift,
        "length": length
    }


def check_shift_word(word, shift, user_answer):
    """Check answer for word shift"""
    try:
        if not isinstance(user_answer, str):
            raise ValueError("Answer must be a string")
        correct_answer = ""
        for char in word:
            correct_answer += chr(((ord(char) - 65 + shift) % 26) + 65)
        return {
            "correct": user_answer.upper() == correct_answer,
            "user_answer": user_answer.upper(),
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError, AttributeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }
