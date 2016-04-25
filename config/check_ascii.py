import json
files = ["go-ussd_public.ibo_NG.json"]


def is_ascii(s):
    return all(ord(c) < 128 for c in s)

current_message_id = 0
for file_name in files:
    json_file = open(file_name, "rU").read()
    json_data = json.loads(json_file)
    print "Proccessing %s\n-------" % file_name

    for key, value in json_data.items():
        # Ignore non-content keys and empty keys
        if len(value) == 2:
            if not is_ascii(value[1]):
                print ("Non-ascii translation found of <%s>: %s" % (key,  value[1]))

    print "Done Proccessing %s\n-------" % file_name
