const fs = require('fs');
var base64 = require('base-64');
const { Octokit } = require("@octokit/core");
const core = require('@actions/core');
const githubToken = core.getInput('github-token');
    async function run(){
        
        let file = fs.readFileSync('./changelog.md', 'utf8').toString();
        let fileBase64 = base64.encode(file);        
        uploadChangelog(fileBase64, 'changelog.md')
    }
    async function getSHA(){
        let token = githubToken
        const octokit = new Octokit({ auth: token});
        return  octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: 'archaic10',
            repo: 'test-changelog',
            path: 'changelog.md'
        }, (response)=>{
            return response.data.sha
        }).catch((error)=>{
            return error.status
        })
        
    
    }
    async function uploadChangelog(content, fileName){
        let token = githubToken
        const octokit = new Octokit({ auth: token});        
        let param;
        let sha = await getSHA();        
        param = {
            owner: 'archaic10',
            repo: 'test-changelog',
            path: 'changelog.md',
            message: 'ci: update changelog',
            content: content
        }
        
        if(sha != 404 )
            param["sha"] = sha.data.sha;        
        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', param).then((res)=>{
            console.log({
                'statusCode':sha != 404 ? 200 : 201,
                'headers': {
                    'Content-Type': 'application/json',
                },
                'body': {
                    'message': sha != 404 ? 'Arquivo atualizado' : 'Arquivo criado',
                }
            })
            
        }).          
        catch(function(error){   
            console.log(error)
        })
    }
    run()