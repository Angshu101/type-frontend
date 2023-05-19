import { useSelector } from "react-redux";
import { calculateChartStats } from "../../utils/calculateChartStats";
import { round, secondsToTime } from '../../utils/utils';
import ResultChart from "./ResultChart"
import { State } from "../../context/reducer";
import { useEffect, useState } from "react";
import { calculateStats } from "../../utils/calculateStats";
import firebase from 'firebase/compat/app';
import { useCreateTestMutation } from "../../generated/graphql";
import styles from '../../styles/Footer.module.css';

const Footer = () => {
    const {
        time: { timerId, timer, testTaken },
        preferences: { time },
        result: { results },
    } = useSelector((state: State) => state);
    const [, createTest] = useCreateTestMutation();
    const [showResult, setShowResult] = useState(false);
    const { wpm, accuracy, incorrectChars, correctChars, rawWpm } = calculateStats();
    const {
        typedWordDataset,
        wordNumberLabels,
        wpmDataset,
        incorrectCharsDataset,
    } = calculateChartStats();

    useEffect(() => {
        if (!timer && timerId) {
            results.splice(1, 0, {
                wpm: wpm,
                rawWpm: rawWpm,
                accuracy: accuracy,
                correctChars: correctChars,
                incorrectChars: incorrectChars,
                time: time,
                testTaken: testTaken,
                typedWordDataset: typedWordDataset,
                wordNumberLabels: wordNumberLabels,
                wpmDataset: wpmDataset,
                incorrectCharsDataset: incorrectCharsDataset
            });
        }
    }, [timer, timerId]);

    useEffect(() => {
        async function test() {
            if (firebase.auth().currentUser && !timer && timerId) {
                await createTest({
                    chars: `${correctChars} / ${incorrectChars}`,
                    wpm: Math.round(wpm),
                    rawWpm: Math.round(rawWpm),
                    accuracy: round(accuracy, 1),
                    time: `${time}`,
                    uid: `${firebase.auth().currentUser!.uid}`,
                    testTaken: testTaken,
                    typedWordDataset: typedWordDataset,
                    wordNumberLabels: wordNumberLabels,
                    wpmDataset: wpmDataset,
                    incorrectCharsDataset: incorrectCharsDataset
                })
            }
        }
        test()
    }, [timer, timerId]);

    useEffect(() => {
        results.length > 1 ? setShowResult(true) : setShowResult(false)
    }, [results.length])

    return (
        <div className={styles.footer} style={{ display: showResult ? "flex" : "none" }}>
            <table>
                <thead>
                    <tr>
                        <th className={styles.sno}>S:No</th>
                        <th className={styles.wpm}>WPM</th>
                        <th className={styles.raw}>Raw WPM</th>
                        <th className={styles.acc}>Accuracy</th>
                        <th className={styles.chars}>Chars</th>
                        <th className={styles.time}>Time</th>
                        <th className={styles.testTaken}>Taken</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((object, index) => {
                        if (index == 0) {
                            return null
                        }
                        else {
                            return (
                                <tr key={index}>
                                    <td className={styles.sno}>{index}</td>
                                    <td className={styles.wpm}>{Math.round(object.wpm)}</td>
                                    <td className={styles.raw}>{Math.round(object.rawWpm)}</td>
                                    <td className={styles.acc}>{round(object.accuracy, 1)}%</td>
                                    <td className={styles.chars}>{object.correctChars}{' '}/{' '}{object.incorrectChars}</td>
                                    <td className={styles.time}>{secondsToTime(object.time)}</td>
                                    <td className={styles.testTaken}>{object.testTaken}</td>
                                </tr>
                            );
                        }
                    })}
                </tbody>
            </table>
            <div className={styles.chart}>
                {results.map((object, index) => {
                    if (index == 1) {
                        return (
                            <ResultChart key={index} wpmDataset={object.wpmDataset} wordNumberLables={((object.wordNumberLabels).length === 0) ? [1, 2] : object.wordNumberLabels} typedWordDataset={object.typedWordDataset} incorrectCharsDataset={object.incorrectCharsDataset} />
                        );
                    }
                    else {
                        return null
                    }
                })}
            </div>
        </div>
    )
}

export default Footer