import readline from 'readline'
import chalk from 'chalk'

function promptQuestions(question)
{
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(question, otp => {
            resolve(otp);
            rl.close();
        });
    });
}

export default async function getOtp(mobile)
{
  return await promptQuestions(chalk.green('Enter Otp ? '));
}