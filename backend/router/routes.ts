import express from 'express';

const router = express.Router();

// Paths
import createuser from '../modules/account/createuser.ts'
import fetchuser from '../modules/account/fetchuser.ts';
import fetchuserteams from '../modules/account/fetchuserteams.ts';
import { fetchuserinvites, updateinvites } from '../modules/account/userinvites.ts';
import fetchsupervisorteams from '../modules/supervisor/fetchsupervisorteams.ts'
import usersearch from '../modules/supervisor/usersearch.ts'
import createteam from '../modules/supervisor/createteam.ts'
import githubConnect from 'modules/account/githubconnect.ts';
import verifygithub from 'modules/github/verifygithub.ts';
import fetchgithubrepo from 'modules/github/fetchgithubrepo.ts'
import linkgithubrepo from 'modules/github/linkgithubrepo.ts'
import updateDatabase from 'modules/github/updateDatabase.ts';
import fetchallaccount from 'modules/account/fetchallaccount.ts';
import fetchteam from 'modules/account/fetchteam.ts';
import engagement from 'modules/metrics/engagement.ts'
import connectTrello from 'modules/trello/connectTrello.ts';
import fetchtrelloboard from 'modules/trello/fetchtrelloboard.ts';
import linktrelloboard from 'modules/trello/linktrelloboard.ts';
import verifyTrello from 'modules/trello/verifytrello.ts';
import updateTrelloDatabase from 'modules/trello/updateTrelloDatabase.ts';
import topcontributors from 'modules/metrics/topcontributors.ts';
import teamname from 'modules/account/teamname.ts'
import fetchactionsforgraph from 'modules/metrics/fetchactionsforgraph.ts';
import fetchactionsperuser from 'modules/metrics/fetchactionsperuser.ts';
import fetchtrellolists from 'modules/trello/fetchtrellolists.ts'
import fetchtrellocards from 'modules/trello/fetchtrellocards.ts'
import updatetrello from 'modules/webhook/updatetrello.ts'
import updategithub from 'modules/webhook/updategithub.ts'
import fetchcommitsperuser from 'modules/metrics/fetchcommitsperuser.ts'
import deleteuser from 'modules/account/deleteuser.ts'
import deleteteams from 'modules/supervisor/deleteteams.ts'
import gdpragreement from 'modules/account/gdpragreement.ts'
import fetchteammembers from 'modules/account/fetchteammembers.ts';
import fetchusercommits from 'modules/account/fetchusercommits.ts';
import reportuser from 'modules/account/reportuser.ts'
import fetchNotifications from 'modules/notifications/fetchNotifications.ts';
import deleteNotification from 'modules/notifications/deleteNotification.ts';

// Routes

// User
router.post('/createuser', createuser)
router.get('/fetchuser', fetchuser)
router.get('/deleteuser', deleteuser)
router.post('/gdpragreement', gdpragreement)
router.post('/fetchteammembers', fetchteammembers);
router.get('/fetchusercommits', fetchusercommits);
router.post('/reportuser', reportuser)


// User Teams
router.get('/fetchuserteams', fetchuserteams)
router.get('/fetchteam', fetchteam)
router.get('/teamname', teamname)

// Supervisor Teams
router.get('/fetchsupervisorteams', fetchsupervisorteams)
router.get('/usersearch', usersearch)
router.post('/createteam', createteam)
router.post('/githubconnect', githubConnect)
router.post(`/deleteteams`, deleteteams)
router.get(`/fetchNotifications`, fetchNotifications)
router.post('/deleteNotification', deleteNotification)

//Teams
router.get('/fetchteammembers', fetchteammembers);


//User Invites
router.get('/fetchuserinvites', fetchuserinvites);
router.post('/updateinvites', updateinvites);


// Github
router.get('/verifygithub', verifygithub);
router.get('/fetchgithubrepo', fetchgithubrepo);
router.get('/linkgithubrepo', linkgithubrepo);
router.get('/updateDatabase', updateDatabase);
router.get('/fetchallaccount', fetchallaccount);

//trello 
router.post('/connecttrello', connectTrello)
router.get('/fetchtrelloboard', fetchtrelloboard)
router.get('/linktrelloboard', linktrelloboard);
router.get('/verifytrello', verifyTrello);
router.get('/updatetrellodatabase', updateTrelloDatabase)
router.get('/fetchtrellolists', fetchtrellolists)
router.get('/fetchtrellocards', fetchtrellocards)

//metrics
router.get('/engagement', engagement);
router.get('/topcontributors', topcontributors)
router.get('/fetchactionsforgraph', fetchactionsforgraph)
router.get('/fetchactionsperuser', fetchactionsperuser)
router.get('/fetchcommitsperuser', fetchcommitsperuser)





//Webhooks 
// https://stackoverflow.com/questions/50240790/node-and-express-how-to-implement-basic-webhook-server
//Trello https://developer.atlassian.com/cloud/trello/guides/rest-api/webhooks/
router.head('/updatetrello', (req,res) => {
    //to verify before sending to post
    console.log("verifying");
    res.sendStatus(200);
})

router.post('/updatetrello', (req, res) => {
    res.sendStatus(200);
    updatetrello(req);
});

//Github
router.post('/updategithub', (req, res) => {
    updategithub(req);
    //say message was recieved 
    res.sendStatus(200);
});

export default router;
