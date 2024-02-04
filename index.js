import express from "express";
import bodyParser from "body-parser";
import fs, { readFileSync } from "fs";
import { stringify } from "querystring";

const app = express();
const port = 3000;
const journalEntriesPath = "/Users/selinaxue/Desktop/webDevNote/BackEnd/Personal Journal Capstone Project/journalEntries/journalEntries.json";

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"));

//function to read journal entries from the json file
function readJournalEntries(){
    
    if(fs.existsSync(journalEntriesPath)){
        const data = readFileSync(journalEntriesPath, "utf-8");

        if(data){
            return JSON.parse(data); //converts JSON string from the file into JS array
        }
    }

    console.log("The journal entry is empty or does not exist.");
    return [];

}

//function to save journal files 
function saveJournalEntry(title, content){   

    const journalEntries = readJournalEntries();

    if (title){
        // Find if an entry with the same title exists
        const existedTitleIndex = journalEntries.findIndex(e => e.JournalTitle === title);
    
        if (existedTitleIndex != -1){
            //update the old value
            journalEntries[existedTitleIndex].JournalContent = content;
        }
        else{
            journalEntries.unshift({JournalTitle: title, JournalContent: content}); //adds the newest key-value pair to the beginning of the array
        }
        
        fs.writeFileSync(journalEntriesPath, JSON.stringify(journalEntries),"utf-8"); //writes the updated array (& convert to string) to the path
    }
    else{
        const date = new Date();
        const day = date.getDate();
        const whichMonth = date.getMonth(); //Jan is 0
        const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const year = date.getFullYear();
        const fullDate = `${month[whichMonth]} ${day}, ${year}`;

        journalEntries.unshift({JournalTitle: fullDate, JournalContent: content});
        fs.writeFileSync(journalEntriesPath, JSON.stringify(journalEntries),"utf-8");
    }

}

//get requests
app.get("/",(req,res)=>{
    const journalEntries = readJournalEntries();

    res.render("index.ejs", { journalEntries });
});

app.get("/NewJournal",(req,res)=>{
    res.render("newJournal.ejs"); 
});

app.get("/journal/:title",(req,res)=>{ //':title' is a route parameter, it acts like a placeholder for the actual value that will appear in the URL
    //When a request is made to the server, any segment of the URL that matches the ':title' pattern is available in the route handler as req.params.title.
    const title = decodeURIComponent(req.params.title);

    const journalEntries = readJournalEntries();

    const entry = journalEntries.find(e => e.JournalTitle === title); //'e' represents an element of the journalEntries array during each iteration, and returns a boolean value. 
    //the .find() method, which is a JavaScript array method that returns the first element in the array that satisfies the provided testing function.
    if (entry){
        res.render("journalEntry.ejs", {journalEntry: entry});
    }
    else{
        res.status(404).send("Journal entry not found.");
    }
});


//post requests
app.post("/",(req,res)=>{
    const title = req.body["title"];
    const content = req.body["content"];
    
    saveJournalEntry(title, content);
    res.redirect("/"); //redirecting the page prevents resubmissions if the page is reloaded, and cleaner URL
});

app.post("/edit",(req,res)=>{
    const originalTitle = req.body["title"];
    const originalContent = req.body["content"];

    res.render("edit.ejs",{
        CurrentTitle: originalTitle,
        CurrentContent: originalContent
    });

});

app.post("/save",(req,res)=>{
    const newTitle = req.body["newTitle"];
    const newContent = req.body["newContent"];
    const originalTitle = req.body["originalTitle"];
    const originalContent = req.body["originalContent"];

    const journalEntries = readJournalEntries();
    const oldJournal = journalEntries.find(e => e.JournalTitle === originalTitle);

    //replace old values
    oldJournal.JournalTitle = newTitle;
    oldJournal.JournalContent = newContent;

    fs.writeFileSync(journalEntriesPath, JSON.stringify(journalEntries),"utf-8");

    res.redirect("/");
});

app.post("/delete",(req,res)=>{
    const title = req.body["title"];
    const journalEntries = readJournalEntries();
    
    const index = journalEntries.findIndex(e => e.JournalTitle === title);

    if (index !== -1){
        journalEntries.splice(index,1);
        fs.writeFileSync(journalEntriesPath, JSON.stringify(journalEntries), "utf-8" );
    }

    res.redirect("/");
});


app.listen(port, ()=>{
    console.log(`Port ${port} successfully started.`);
});