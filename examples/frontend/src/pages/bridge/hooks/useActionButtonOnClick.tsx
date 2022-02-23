import {ethers} from "ethers";
import {SetStateFunction} from "@utils";
import {ButtonProps} from "@components/Button";


export function useActionButtonOnClick(
    setDisabled:    SetStateFunction<boolean>,
    setButtonProps: SetStateFunction<ButtonProps>
) {
    const fn = (executeTxnFn: () => Promise<ethers.providers.TransactionResponse>) => {
        return async () => {
            setButtonProps({
                text:     "Waiting for transaction to send...",
            });
            setDisabled(true);

            try {
                const txn = await executeTxnFn();

                setButtonProps({
                    text: "waiting for transaction to confirm..."
                });
                setDisabled(true);

                await txn.wait(1);

                setButtonProps({
                    text: "Success!"
                });
            } catch (e) {
                const err = e instanceof Error ? e : new Error(e);
                console.error(err);
                setButtonProps({
                    text:     `Error: ${err.message}`,
                });
                setDisabled(true);
            }

            return
        }
    }

    return [fn] as const
}
