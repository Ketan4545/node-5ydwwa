// run `node index.js` in the terminal
 
​var​ ​express​ ​=​ ​require​(​'express'​)​; 
​const​ ​cors​ ​=​ ​require​(​'cors'​)​; 
​var​ ​request​ ​=​ ​require​(​'request'​)​; 
​var​ ​fs​ ​=​ ​require​(​'fs'​)​; 
​const​ ​axios​ ​=​ ​require​(​'axios'​)​; 
 
 
​var​ ​app​ ​=​ ​express​(​)​; 
 
 
 
​app​.​use​(​cors​(​)​)​; 
​// app.use(express.urlencoded({ extended: true })); 
​// app.use(express.json()); 
 
​app​.​use​(​express​.​json​(​{​limit​: ​'50mb'​}​)​)​; 
​app​.​use​(​express​.​urlencoded​(​{​limit​: ​'50mb'​,​ ​extended​: ​true​}​)​)​; 
 
 
​const​ ​{​ generateFile ​}​ ​=​ ​require​(​"./generateFile"​)​; 
​const​ ​{​executeCpp​}​ ​=​require​(​"./executeCpp"​)​; 
​const​ ​{​ executePy ​}​ ​=​ ​require​(​'./executePy'​)​; 
​const​ ​{​User​,​ DataUser​,​ JobList​,​baseUrl​,​ Chart​}​ ​=​ ​require​(​"./config"​)​; 
​const​ ​{​logger​}​ ​=​ ​require​(​"./logger"​) 
​const​ ​{​client​,​ Client​}​ ​=​ ​require​(​"./Elephantsql"​) 
​//const {client, Client} = require("./pgdb") 
 
 
​app​.​get​(​'/'​,​ ​function​ ​(​req​,​ ​res​)​ ​{ 
​   ​res​.​send​(​'Hello World'​)​; 
​}​)​  
 
 
 
​app​.​post​(​"/run"​,​ ​async​ ​(​req​,​ ​res​)​ ​=>​{ 
​   ​const​ ​{​ language ​=​ ​"cpp"​,​ code ​}​ ​=​ ​req​.​body​; 
​   
​if​ ​(​code​ ​===​ ​undefined​)​ ​{ 
​      ​return​ ​res​.​status​(​400​)​.​json​(​{​ ​success​: ​false​,​ ​error​: ​"Empty code body!"​ ​}​)​; 
​    ​} 
 
​try​ ​{ 
​    ​// need to generate a c++ file with content from the request 
​  ​const​ ​filepath​ ​=​ ​await​ ​generateFile​(​language​,​ ​code​)​; 
 
​  ​//we need to run the file and send response back 
​let​ ​output​; 
​if​ ​(​language​ ​===​ ​"cpp"​)​{ 
​ ​output​ ​=​ ​await​ ​executeCpp​(​filepath​)​; 
​}​ ​else​ ​{ 
​   ​output​ ​=​ ​await​ ​executePy​(​filepath​)​; 
​} 
 
​console​.​log​(​language​,​ ​"Length:"​,​ ​code​.​length​)​; 
​fs​.​unlinkSync​(​filepath​)​; 
​console​.​log​(​"file deleted"​,​ ​filepath​) 
​return​ ​res​.​status​(​200​)​.​json​(​output​)​; 
 
​}​ ​catch​ ​(​err​)​{ 
​   ​res​.​status​(​500​)​.​json​(​{​err​}​)​; 
 
​} 
 
​}​)​; 
 
​app​.​get​(​"/fetchProcedure"​,​ ​async​ ​(​req​,​ ​res​)​ ​=>​ ​{ 
​   ​const​ ​snapshot​ ​=​ ​await​ ​User​.​get​(​)​; 
​   ​// const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })); 
​   ​const​ ​list​ ​=​ ​snapshot​.​docs​.​map​(​(​doc​)​ ​=>​ ​(​doc​.​id​)​)​; 
​    
​    ​res​.​send​(​list​)​; 
​ ​}​)​; 
 
 
 
​//  app.post("/fetchProcedureData", async (req, res) => { 
​    
​//    const name = req.body.name; 
​//    try{ 
​//    const snapshot = await User.doc(name); 
​   
​//    snapshot.get().then((doc) => { 
​//       if (doc.exists) { 
​//           //console.log("Document data:", doc.data()); 
​//           res.send(doc.data()); 
​//       } else { 
​//           // doc.data() will be undefined in this case 
​//           //console.log("No such document!"); 
​//           res.send(`No such [[${name}]] documents!`); 
​//       } 
​    
​    
​//    }) 
​//      } catch (err){ 
​//       res.status(500).json({err}); 
​    
​//    } 
​    
​//  }); 
​  
 
​//  app.post("/createProcedure", async (req, res) => { 
​//    const data = req.body; 
​//    const name = data.procName 
​//    console.log(data) 
​//    await User.doc(name).set(data); 
​//    res.send({ message: `procedure [[${name}]] has been created or updated successfully.` }); 
​//    logger.log('info', `procedure [[${name}]] has been created or updated successfully.`) 
 
​//  }); 
​  
​//  app.post("/updateProcedure", async (req, res) => { 
​//    const name = req.body.procName;  
​//    const data = req.body; 
​//    await User.doc(name).update(data); 
​//    res.send({ msg: "Updated" }); 
​//  }); 
​  
​//  app.post("/deleteProcedure", async (req, res) => { 
​//    const name = req.body.name;  
​//    // await User.doc(name).delete(); 
​//    // res.send({ message: `Procedure [[${name}]] has been deleted successfully.` }); 
 
​//    try{ 
​//       const snapshot = await User.doc(name); 
​      
​//       snapshot.get().then((doc) => { 
​//          if (doc.exists) { 
​//             User.doc(name).delete(); 
​//             res.send({ message: `Procedure [[${name}]] has been deleted successfully.` }); 
​//          } else { 
 
​//              res.send(`No such [[${name}]] documents!`); 
​//          } 
​       
​       
​//       }) 
​//         } catch (err){ 
​//          res.status(500).json({Error : `Error during deleting [[${name}]] procedure.`}); 
​       
​//       } 
​       
 
​//  }); 
 
 
​//  //Element CRUD operation logic is  below by Ketan 04 Feb 2022 
 
​//  app.post("/selectElement", async (req, res) => { 
​//    const name = req.body.name;  
​//     if (name ===undefined){ 
​//       res.send("Element body is empty.");   
​//     } 
 
​//    try{    
​//      await DataUser.child(name).once('value', function (snapshot) { 
​//          if (snapshot.val()) { 
​//             res.send(snapshot.val()); 
​//         } else { 
​//             res.send(`No such [[${name}]] documents!`); 
​//         }    
​//      }); 
​//    } catch (err){ 
​//       res.status(500).json({err}); 
​    
​//    } 
​//  }); 
 
​//  app.post("/updateElement", async (req, res) => { 
​//    const name = req.body.name;  
​//    const data = req.body.data; 
​    
​// try{ 
​//  await DataUser.child(name).update(JSON.parse(data)).then(() => { 
​//    res.send(`Element [[${name}]] updated successfully!`); 
​// }) 
​// } 
​// catch(err){ 
​//       console.log(err); 
​//       res.status(500).json({error : `Error during updating [[${name}]] element.`}); 
​//  }; 
​// }) 
 
​// app.post("/deleteElement", async (req, res) => { 
​//    const name = req.body.name;  
​    
​//    try{    
​//       await DataUser.child(name).once('value', function (snapshot) { 
​//           if (snapshot.val()) { 
​//             DataUser.child(name).remove(); 
​//             res.send({ message: `Element [[${name}]] has been deleted successfully.` }); 
 
​//          } else { 
​//              res.send(`No such [[${name}]] documents!`); 
​//          }    
​//       }); 
​//     } catch (err){ 
​//        res.status(500).json({Error : `Error during deleting [[${name}]] element.`}); 
​     
​//     } 
​//  }); 
 
 
 
​//  // run Procedure function for exectuting procedure 5 Feb 2022 
 
​//  app.post("/runProcedure", async (req, res) => { 
​    
​//    const name = req.body.name; 
​//    try{ 
​//    const snapshot = await User.doc(name); 
​   
​//    snapshot.get().then((doc) => { 
​//       if (doc.exists) { 
​//           //console.log("Document data:", doc.data()); 
​//            //console.log("Document data:", doc.data()); 
​//           const procName = doc.data().procName 
​//           const  procSelect = doc.data().procSelect 
​//           const procBody = doc.data().procBody 
​//           const procUpdate = doc.data().procUpdate 
​//           console.log(procSelect) 
​          
​//            if (procSelect ===undefined){ 
​//             res.send("No select document present in database!");   
​//           } 
​       
​//          try{    
​//               DataUser.child(procSelect).once('value', function (snapshot) { 
​//                if (snapshot.val()) { 
​//                   const selectvalue = `input = ${JSON.stringify(snapshot.val())} \n`  
 
​//                 console.log(selectvalue) 
​//                   async function runProcedure(){ 
​//                      //   const { language = "cpp", code } = req.body; 
​//                      const language = "py" 
​//                      const code = selectvalue + procBody 
​//                      console.log(code) 
​               
​//                        if (code === undefined) { 
​//                              return res.status(400).json({Message : "Empty code body of python documens are not executable!" }); 
​//                            } 
​//                            const filepath = await generateFile(language, code); 
​                        
​//                        try { 
​//                            // need to generate a c++ or py file with content from the request 
​//                          //const filepath = await generateFile(language, code); 
​                        
​//                        //we need to run the file and send response back 
​//                        let output; 
​//                        if (language === "cpp"){ 
​//                         output = await executeCpp(filepath); 
​//                        } else { 
​//                           output = await executePy(filepath); 
​//                        } 
​                        
​//                        console.log(language, "Length:", code.length); 
​//                        fs.unlinkSync(filepath); 
​//                        console.log("file deleted", filepath) 
 
​//                        const jsOutput = output.replace(/'/g, '"').replace(/False/g, false).replace(/True/g, true); 
​                   
​                          
​//                        async function updateData(){ 
​//                         try{ 
​//                            await DataUser.child(procUpdate).update(JSON.parse(jsOutput)).then(() => { 
​//                              res.send({Success : `Procedure ${name} completed sccessfully!`, Message :`Element [[${procUpdate}]] updated successfully!`}); 
​//                           }) 
​//                           } 
​//                           catch(err){ 
​//                                 console.log(err); 
​//                                 res.status(500).json({Error : `Procedure ${name} failed - ${err}`, Message : `Error during updating [[${procUpdate}]] element.`}); 
​//                            }; 
​//                        } 
​//                      updateData() 
​                        
​//                        } catch (err){ 
​//                         fs.unlinkSync(filepath); 
​//                         console.log("file deleted", filepath) 
​//                           res.status(500).json({Error : err,  Message : `Error in python code`}); 
​//                        }            
​             
​//                      } 
​//                      runProcedure() 
​             
​//                       //res.send(procName); 
​//                   } else { 
​//                       // doc.data() will be undefined in this case 
​//                       res.send({Message : `No such select element [[${procSelect}]] are exist in documents!`}); 
​//                   } 
​                
​                
​//                }) 
​//                  } catch (err){ 
​//                   res.status(500).json({Error : `Internal server Error - ${err} `, Message : `Any input of procedure are null or not executable or in bad format.`});            
​//                   //res.send({Error : `Internal server Error - ${err} `, Message : `Any input of procedure are null or not executable or in bad format.`});            
​             
​//                } 
 
​//               } else { 
​//                   res.send({Message : `No such procedure [[${name}]] exist in documents!`}); 
​//               }    
​//            }); 
 
​//          } catch (err){ 
​//             res.status(500).json({Error : `Internal server Error - ${err} `}); 
​          
​//          } 
​//  }); 
 
 
​ ​// Job Listing in database and fetching for run 
 
​ ​app​.​post​(​"/fetchJobList"​,​ ​async​ ​(​req​,​ ​res​)​ ​=>​ ​{ 
​    
​   ​const​ ​name​ ​=​ ​req​.​body​.​name​; 
​   ​try​{ 
​   ​const​ ​snapshot​ ​=​ ​await​ ​JobList​.​doc​(​name​)​; 
​   
​   ​snapshot​.​get​(​)​.​then​(​(​doc​)​ ​=>​ ​{ 
​      ​if​ ​(​doc​.​exists​)​ ​{ 
​          ​//console.log("Document data:", doc.data()); 
​          ​const​ ​arr_JobList​ ​=​ ​doc​.​data​(​)​[​"Job"​] 
​          ​res​.​send​(​doc​.​data​(​)​)​; 
​      ​}​ ​else​ ​{ 
​          ​// doc.data() will be undefined in this case 
​          ​//console.log("No such document!"); 
​          ​res​.​send​(​`No such [[​${​name​}​]] documents!`​)​; 
​      ​} 
​    
​    
​   ​}​) 
​     ​}​ ​catch​ ​(​err​)​{ 
​      ​res​.​status​(​500​)​.​json​(​{​Error​ : ​`Internal server Error - ​${​err​}​ `​,​ ​Message​ : ​`Name of job or steps are null or contains special characters or in bad format.`​}​)​; 
​    
​   ​} 
​    
​ ​}​)​; 
 
 
 
​ ​app​.​post​(​"/createJob"​,​ ​async​ ​(​req​,​ ​res​)​ ​=>​ ​{ 
​   ​const​ ​data​ ​=​ ​req​.​body​.​data​; 
​   ​const​ ​name​ ​=​ ​req​.​body​.​name 
​   ​console​.​log​(​data​) 
​   ​try​{ 
​   ​await​ ​JobList​.​doc​(​name​)​.​set​(​JSON​.​parse​(​data​)​)​; 
​   ​res​.​send​(​{​ ​Message​: ​`procedure [[​${​name​}​]] has been created or updated successfully.`​ ​}​)​; 
​   ​}​catch​ ​(​err​)​{ 
​      ​res​.​status​(​500​)​.​json​(​{​Error​ : ​`Internal server Error - ​${​err​}​ `​,​ ​Message​ : ​`Name of job or steps are null or contains special characters or in bad format.`​}​)​; 
​    
​   ​} 
​ ​}​)​; 
 
 
 
​ ​app​.​post​(​"/updateJob"​,​ ​async​ ​(​req​,​ ​res​)​ ​=>​ ​{ 
​   ​const​ ​name​ ​=​ ​req​.​body​.​name​;​  
​   ​const​ ​data​ ​=​ ​req​.​body​.​data​; 
​   ​try​{ 
​   ​await​ ​JobList​.​doc​(​name​)​.​update​(​JSON​.​parse​(​data​)​)​; 
​   ​res​.​send​(​{​ ​msg​: ​"Updated"​ ​}​)​; 
​   ​}​catch​ ​(​err​)​{ 
​      ​res​.​status​(​500​)​.​json​(​{​Error​ : ​`Internal server Error - ​${​err​}​ `​,​ ​Message​ : ​`Name of job or steps are null or contains special characters or in bad format.`​}​)​; 
​    
​   ​} 
​ ​}​)​; 
​  
 
​ ​app​.​post​(​"/runJob"​,​ ​async​ ​(​req​,​ ​res​)​ ​=>​ ​{ 
​    
​   ​const​ ​nameJob​ ​=​ ​req​.​body​.​name​; 
​   ​try​{ 
​   ​const​ ​snapshot​ ​=​ ​await​ ​JobList​.​doc​(​nameJob​)​; 
​   
​   ​snapshot​.​get​(​)​.​then​(​(​doc​)​ ​=>​ ​{ 
​      ​if​ ​(​doc​.​exists​)​ ​{ 
​         ​// arr_JobList is array of procedure name       
​          ​const​ ​arr_JobList​ ​=​ ​doc​.​data​(​)​[​"Job"​] 
​          ​console​.​log​(​arr_JobList​) 
 
​          ​async​ ​function​ ​testingOne​(​)​{ 
​          
​          ​for​(​var​ ​i​=​0​;​ ​i​ ​<​ ​arr_JobList​.​length​;​ ​i​++​)​ ​{ 
​             ​const​ ​name​ ​=​ ​arr_JobList​[​i​] 
​            
​             ​axios​.​post​(​`​${​baseUrl​}​/runProcedure`​,​ ​{ 
​               ​name​ : ​name 
​             ​}​) 
​             ​.​then​(​function​ ​(​response​)​ ​{ 
​               ​console​.​log​(​response​.​data​)​; 
​             ​}​) 
​             ​.​catch​(​function​ ​(​error​)​ ​{ 
​               ​console​.​log​(​error​)​; 
​             ​}​)​; 
​                               
​                 ​if​(​i​ ​===​ ​arr_JobList​.​length​-​1​)​{ 
​                    ​res​.​send​(​`Job ​${​nameJob​}​ is succesful with ​${​arr_JobList​.​length​}​ steps.`​) 
​                 ​} 
​          ​}​} 
​            
​          ​testingOne​(​) 
​          ​//res.send(arr_JobList) 
 
​      ​}​ ​else​ ​{ 
​          ​// doc.data() will be undefined in this case 
​          ​//console.log("No such document!"); 
​          ​res​.​send​(​`No such [[​${​nameJob​}​]] documents!`​)​; 
​      ​} 
​    
​    
​    
​   ​}​) 
 
​     ​}​ ​catch​ ​(​err​)​{ 
​      ​res​.​status​(​500​)​.​json​(​{​Error​ : ​`Internal server Error - ​${​err​}​ `​,​ ​Message​ : ​`Name of job or steps are null or contains special characters or in bad format.`​}​)​; 
​    
​   ​} 
​    
​ ​}​)​; 
 
​ ​app​.​get​(​"/log"​,​ ​(​req​,​ ​res​)​=>​{ 
​    
​   ​try​ ​{ 
​      ​function​ ​readFiles​(​dirname​,​ ​onFileContent​,​ ​onError​)​ ​{ 
​         ​fs​.​readdir​(​dirname​,​ ​function​(​err​,​ ​filenames​)​ ​{ 
​           ​if​ ​(​err​)​ ​{ 
​             ​onError​(​err​)​; 
​             ​return​; 
​           ​} 
​           ​filenames​.​forEach​(​function​(​filename​)​ ​{ 
​             ​fs​.​readFile​(​dirname​ ​+​ ​filename​,​ ​'utf-8'​,​ ​function​(​err​,​ ​content​)​ ​{ 
​               ​if​ ​(​err​)​ ​{ 
​                 ​onError​(​err​)​; 
​                 ​return​; 
​               ​} 
​               ​onFileContent​(​filename​,​ ​content​)​; 
​             ​}​)​; 
​           ​}​)​; 
​         ​}​)​; 
​       ​} 
​        
​   ​var​ ​data​ ​=​ ​{​}​; 
​   ​readFiles​(​'logger/'​,​ ​function​(​filename​,​ ​content​)​ ​{ 
​     
​     ​data​[​filename​]​ ​=​ ​content​; 
​     ​console​.​log​(​content​) 
​     ​console​.​log​(​data​) 
​      ​}​,​ ​function​(​err​)​ ​{ 
​       ​throw​ ​err​; 
​}​)​; 
​  
 
 
​   
 
​      ​console​.​log​(​data​) 
​      ​//res.send(data) 
​      ​logger​.​log​(​'info'​,​ ​`successfully fetched log data`​) 
​    ​}​ ​catch​ ​(​err​)​ ​{ 
​      ​console​.​error​(​err​) 
​    ​} 
​ ​}​) 
 
 
 
​ ​// Postgres database connection and quering happen below here 
 
​ ​app​.​post​(​"/sqlrun"​,​ ​async​ ​(​req​,​ ​res​)​=>​{ 
​   ​data​ ​=​ ​req​.​body​.​data 
​   ​console​.​log​(​data​)​; 
 
​  ​//    client.connect(function(err) { 
​  ​//   if(err) { 
​  ​//     return console.error('could not connect to postgres', err); 
​  ​//   } 
​  ​//   client.query(`${data}`, function(err, result) { 
​       
​  ​//     try{ 
​  ​//       console.log("Test", result) 
​  ​//        res.send(result) 
​  ​//     } catch{ 
​  ​//       console.log("err",err) 
​  ​//       res.status(500).json({Error : `Py-sql error - ${err} `, Message : `${err.message}`}); 
​   
​  ​//     } 
​      
​  ​//  client.end; 
​  ​//   }); 
​  
​  ​// }); 
 
​  ​client​.​connect​(​)​; 
 
​client​.​query​(​`​${​data​}​`​,​ ​(​err​,​ ​result​)​=>​{ 
​  ​// try{ 
​  ​//         console.log("Test", result) 
​  ​//          res.send(result) 
​  ​//       } catch (err) { 
​  ​//         console.log("err",err) 
​  ​//         res.status(500).json({Error : `Py-sql error - ${err} `, Message : `${err.message}`}); 
​     
​  ​//       } 
​  ​if​(​err​)​{ 
​    ​console​.​log​(​"err"​,​err​) 
​     ​res​.​status​(​500​)​.​json​(​{​Error​ : ​`Py-sql error - ​${​err​}​ `​,​ ​Message​ : ​`​${​err​.​message​}​`​}​)​; 
​       
​  ​}​ ​else​{ 
​    ​console​.​log​(​"Test"​,​ ​result​) 
​          ​res​.​send​(​result​) 
​  ​} 
​    ​client​.​end​; 
 
 
​  
​ ​}​) 
​}​) 
 
 
 
​/// Chart CRUD by Ketan 16 Feb 2022 
 
 
​// Create Chart or Update Chart 
 
​app​.​post​(​"/chartCreate"​,​ ​async​ ​(​req​,​ ​res​)​ ​=>​ ​{ 
​  ​const​ ​data​ ​=​ ​req​.​body​; 
​  ​const​ ​name​ ​=​ ​req​.​body​.​name 
​  ​console​.​log​(​data​) 
​  ​try​{ 
​  ​await​ ​Chart​.​doc​(​name​)​.​set​(​data​)​; 
​  ​res​.​send​(​{​ ​message​: ​`Chart [[​${​name​}​]] has been impacted.`​ ​}​)​; 
​  ​logger​.​log​(​'info'​,​ ​`Chart [[​${​name​}​]] has been impacted.`​) 
​  ​}​ ​catch​(​err​)​{ 
​    ​console​.​log​(​err​) 
​    ​res​.​status​(​500​)​.​json​(​{​Error​ : ​`Chart create error - ​${​err​}​ `​,​ ​Message​ : ​`​${​err​.​message​}​`​}​)​; 
​       
​  ​} 
 
​}​)​; 
 
​// Fetch Chart List  
​app​.​get​(​"/chartlistFetch"​,​ ​async​ ​(​req​,​ ​res​)​ ​=>​ ​{ 
 
​  ​try​{ 
​  ​const​ ​snapshot​ ​=​ ​await​ ​Chart​.​get​(​)​; 
​  ​// const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })); 
​  ​const​ ​list​ ​=​ ​snapshot​.​docs​.​map​(​(​doc​)​ ​=>​ ​(​doc​.​id​)​)​; 
​   
​   ​res​.​send​(​list​)​; 
​  ​}​catch​(​err​)​{ 
​    ​res​.​status​(​500​)​.​json​(​{​Error​ : ​`Chart fetch error - ​${​err​}​ `​,​ ​Message​ : ​`​${​err​.​message​}​`​}​)​; 
​     
​  ​} 
​}​)​; 
 
 
​// Fetch chart list object 
​app​.​post​(​"/chartlistData"​,​ ​async​ ​(​req​,​ ​res​)​ ​=>​ ​{ 
​    
​  ​const​ ​name​ ​=​ ​req​.​body​.​name​; 
​  ​try​{ 
​  ​const​ ​snapshot​ ​=​ ​await​ ​Chart​.​doc​(​name​)​; 
​  
​  ​snapshot​.​get​(​)​.​then​(​(​doc​)​ ​=>​ ​{ 
​     ​if​ ​(​doc​.​exists​)​ ​{ 
​                  ​res​.​send​(​doc​.​data​(​)​)​; 
​     ​}​ ​else​ ​{ 
​             ​res​.​send​(​`No such [[​${​name​}​]] documents!`​)​; 
​     ​} 
​   
​   
​  ​}​) 
​    ​}​ ​catch​ ​(​err​)​{ 
​     ​res​.​status​(​500​)​.​json​(​{​err​}​)​; 
​   
​  ​} 
​   
​}​)​; 
 
 
 
​  
 
​var​ ​server​ ​=​ ​app​.​listen​(​8081​,​ ​function​ ​(​)​ ​{ 
​   ​var​ ​host​ ​=​ ​server​.​address​(​)​.​address 
​   ​var​ ​port​ ​=​ ​server​.​address​(​)​.​port 
​    
​   ​console​.​log​(​"Example app listening at http://%s:%s"​,​ ​host​,​ ​port​) 
​   ​logger​.​log​(​'info'​,​ ​`Example app listening at ,​${​port​}​.`​) 
​}​)