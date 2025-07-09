import bcrypt
password = b"super secret password"
hashed = bcrypt.hashpw(password, bcrypt.gensalt())
print(bcrypt.gensalt())
if bcrypt.checkpw(password, hashed):
    print("It Matches!")
else:
    print("It Does not Match :(")