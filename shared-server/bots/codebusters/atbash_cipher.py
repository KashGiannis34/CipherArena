import random


def generate_atbash_letter():
    """Generate an Atbash cipher letter problem"""
    number = int(random.random() * 26) + 65
    letter = chr(number)
    answer = chr(90 - (number - 65))
    return {
        "type": "atbash_letter",
        "problem": f"Atbash: {letter}",
        "question": f"What is the Atbash cipher decoding of the letter {letter}?",
        "answer": answer,
        "letter": letter,
        "hint": "Atbash reverses the alphabet: A↔Z, B↔Y, C↔X..."
    }


def check_atbash_letter(letter, user_answer):
    """Check answer for Atbash letter cipher"""
    try:
        if not isinstance(user_answer, str) or len(user_answer) == 0:
            return {"error": "Invalid input: answer must be a letter", "correct": False, "user_answer": user_answer}
        number = ord(letter.upper())
        correct_answer = chr(90 - (number - 65))
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


def generate_atbash_word():
    """Generate an Atbash cipher word problem"""
    length = int(random.random() * 4) + 4
    word = ""
    for n in range(length):
        number = int(random.random() * 26) + 65
        word += chr(number)

    answer = ""
    for char in word:
        number = ord(char)
        answer += chr(90 - (number - 65))

    return {
        "type": "atbash_word",
        "problem": f"Atbash: {word}",
        "question": f"What is the Atbash cipher decoding of the \"word\" {word}?",
        "answer": answer,
        "word": word,
        "length": length,
        "hint": "Atbash reverses the alphabet: A↔Z, B↔Y, C↔X..."
    }


def check_atbash_word(word, user_answer):
    """Check answer for Atbash word cipher"""
    try:
        if not isinstance(user_answer, str):
            return {"error": "Invalid input: answer must be a word", "correct": False, "user_answer": user_answer}
        correct_answer = ""
        for char in word:
            number = ord(char.upper())
            correct_answer += chr(90 - (number - 65))
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
