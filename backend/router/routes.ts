import express from 'express';

const router = express.Router();

// Paths
import createuser from '../modules/user/createuser.ts'
import fetchuser from '../modules/user/fetchuser.ts';
import fetchuserteams from '../modules/user/fetchuserteams.ts';
import {fetchuserinvites, updateinvites} from '../modules/user/userinvites.ts';
import fetchsupervisorteams from '../modules/supervisor/fetchsupervisorteams.ts'
import usersearch from '../modules/supervisor/usersearch.ts'
import createteam from '../modules/supervisor/createteam.ts'
import githubConnect from 'modules/user/githubconnect.ts';
import verifygithub from 'modules/github/verifygithub.ts';
import fetchgithubrepo from 'modules/github/fetchgithubrepo.ts'
import linkgithubrepo from 'modules/github/linkgithubrepo.ts'

// Routes

// User
router.post('/createuser', createuser)
router.get('/fetchuser', fetchuser)

// User Teams
router.get('/fetchuserteams', fetchuserteams)

// Supervisor Teams
router.get('/fetchsupervisorteams', fetchsupervisorteams)
router.get('/usersearch', usersearch)
router.post('/createteam', createteam)
router.post('/githubconnect', githubConnect)

//User Invites
router.get('/fetchuserinvites', fetchuserinvites);
router.post('/updateinvites', updateinvites);


// Github
router.get('/verifygithub', verifygithub);
router.get('/fetchgithubrepo', fetchgithubrepo);
router.get('/linkgithubrepo', linkgithubrepo);
export default router;
