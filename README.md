This program reads a CSV file and asks the user to provide arguments depending on the command flag that they provide.

The program has 6 mains functions.
- create `-c`
    - create a new record of a user stored in a Bio class.
    - `node bio.js -c <name> <sex> <age> <height> <weight>`
- read `-r`
    - retrieves a record from the csv and prints it.
    - the record also shows height in centimeters and weight in kilograms.
    - `node bio.js -r <name>`    
- update `-u`
    - updates the record of a user 
    - `node bio.js -u <name> <sex> <age> <height> <weight>`
- delete `-d`
    - deletes the record of a user 
    - `node bio.js -d <name>`
-  readCSV
    - reads a CSV file and converts it into an array.
- writeCSV
    - converts an array into a CSV file whenever create, update, or delete is called.



