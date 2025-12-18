import random
from .constants import NIHILIST_KEYWORDS


def _normalize_keyword(keyword: str) -> str:
    """Normalize a keyword for use in Nihilist cipher table generation"""
    seen = set()
    cleaned = []
    for ch in keyword.upper():
        if 'A' <= ch <= 'Z':
            if ch == 'J':
                ch = 'I'
            if ch not in seen:
                seen.add(ch)
                cleaned.append(ch)
    return "".join(cleaned)


def generate_nihilist_table(keyword=None):
    """Generate a Nihilist substitution table (5x5 Polybius square) using a keyword."""
    alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"

    if not keyword:
        keyword = random.choice(NIHILIST_KEYWORDS)
    norm_key = _normalize_keyword(keyword)

    used = set(norm_key)
    remainder = [ch for ch in alphabet if ch not in used]
    sequence = list(norm_key) + remainder

    table = [sequence[i*5:(i+1)*5] for i in range(5)]
    return table


def nihilist_table_to_display(table):
    """Convert nihilist table to display string"""
    display = "   1  2  3  4  5\n"
    for idx, row in enumerate(table):
        display += f"{idx+1}  " + "  ".join(row) + "\n"
    return display.rstrip()


def nihilist_encode_letter(table, letter):
    """Encode a letter using nihilist table, returns row+col as two-digit number"""
    letter = letter.upper()
    if letter == 'J':
        letter = 'I'

    for row_idx, row in enumerate(table):
        if letter in row:
            col_idx = row.index(letter)
            return (row_idx + 1) * 10 + (col_idx + 1)
    return None


def nihilist_decode_number(table, number):
    """Decode a two-digit number using nihilist table"""
    row = (number // 10) - 1
    col = (number % 10) - 1
    if 0 <= row < 5 and 0 <= col < 5:
        return table[row][col]
    return None


def generate_nihilist_encode():
    """Generate a nihilist encoding problem (letter to number)"""
    keyword = random.choice(NIHILIST_KEYWORDS)
    table = generate_nihilist_table(keyword)

    alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"
    letter = alphabet[int(random.random() * len(alphabet))]

    answer = nihilist_encode_letter(table, letter)

    return {
        "type": "nihilist_encode",
        "problem": f"Nihilist encode: {letter}",
        "question": f"Using the Nihilist table below, what number does the letter {letter} encode to?",
        "answer": answer,
        "letter": letter,
        "table": table,
        "table_display": nihilist_table_to_display(table),
        "hint": "Find the letter in the table. The answer is: (row number)(column number)",
        "keyword": keyword.upper()
    }


def check_nihilist_encode(table, letter, user_answer):
    """Check answer for nihilist encoding"""
    try:
        user_answer_int = int(user_answer)
        correct_answer = nihilist_encode_letter(table, letter)
        return {
            "correct": user_answer_int == correct_answer,
            "user_answer": user_answer,
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError):
        return {
            "error": "Invalid input: answer must be a two-digit number",
            "correct": False,
            "user_answer": user_answer
        }


def generate_nihilist_decode():
    """Generate a nihilist decoding problem (number to letter)"""
    keyword = random.choice(NIHILIST_KEYWORDS)
    table = generate_nihilist_table(keyword)

    row = int(random.random() * 5) + 1
    col = int(random.random() * 5) + 1
    number = row * 10 + col

    answer = nihilist_decode_number(table, number)

    return {
        "type": "nihilist_decode",
        "problem": f"Nihilist decode: {number}",
        "question": f"Using the Nihilist table below, what letter does the number {number} decode to?",
        "answer": answer,
        "number": number,
        "table": table,
        "table_display": nihilist_table_to_display(table),
        "hint": "First digit is row, second digit is column",
        "keyword": keyword.upper()
    }


def check_nihilist_decode(table, number, user_answer):
    """Check answer for nihilist decoding"""
    try:
        if not isinstance(user_answer, str) or len(user_answer) == 0:
            return {"error": "Invalid input: answer must be a letter", "correct": False, "user_answer": user_answer}
        correct_answer = nihilist_decode_number(table, number)
        return {
            "correct": user_answer.upper() == correct_answer.upper(),
            "user_answer": user_answer.upper(),
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError, AttributeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }


def generate_nihilist_keyword_decode():
    """Generate Nihilist decode given a ciphertext NUMBER and a keyword letter (decode = ciphertext - keyword)."""
    keyword = random.choice(NIHILIST_KEYWORDS)
    table = generate_nihilist_table(keyword)

    p_r = int(random.random() * 5) + 1
    p_c = int(random.random() * 5) + 1
    plaintext_letter = table[p_r - 1][p_c - 1]

    k_r = int(random.random() * 5) + 1
    k_c = int(random.random() * 5) + 1
    keyword_letter = table[k_r - 1][k_c - 1]

    p_num = p_r * 10 + p_c
    k_num = k_r * 10 + k_c
    ciphertext_number = p_num + k_num

    return {
        "type": "nihilist_keyword_decode",
        "problem": f"Nihilist decode with key: cipher {ciphertext_number}, key {keyword_letter}",
        "question": f"Using the Nihilist table below and keyword letter {keyword_letter}, decode the ciphertext number {ciphertext_number}.",
        "answer": plaintext_letter,
        "ciphertext_number": ciphertext_number,
        "keyword_letter": keyword_letter,
        "table": table,
        "table_display": nihilist_table_to_display(table),
        "hint": "Find the number for the keyword letter using the table. Subtract that from the ciphertext number. The answer is the letter at the row and column of the result.",
        "keyword": keyword.upper()
    }


def check_nihilist_keyword_decode(table, ciphertext_number, keyword_letter, user_answer):
    """Check Nihilist decode with keyword letter where plaintext = ciphertext_number - num(keyword_letter)."""
    try:
        if not isinstance(user_answer, str) or len(user_answer) == 0:
            return {"error": "Invalid input: answer must be a letter", "correct": False, "user_answer": user_answer}

        k_num = nihilist_encode_letter(table, keyword_letter)
        if k_num is None:
            return {"error": "Invalid keyword letter for table", "correct": False, "user_answer": user_answer}

        p_num = int(ciphertext_number) - k_num
        if p_num < 11 or p_num > 55:
            return {"error": "Resulting pair is out of range", "correct": False, "user_answer": user_answer}
        p_r, p_c = p_num // 10, p_num % 10
        if not (1 <= p_r <= 5 and 1 <= p_c <= 5):
            return {"error": "Invalid row/col after subtraction", "correct": False, "user_answer": user_answer}
        correct_answer = table[p_r - 1][p_c - 1]
        return {
            "correct": user_answer.upper() == correct_answer,
            "user_answer": user_answer.upper(),
            "correct_answer": correct_answer
        }
    except Exception as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }
