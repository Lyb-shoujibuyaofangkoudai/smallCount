import { useLocalSearchParams } from "expo-router";
import AddTransactionScreen from "../_addOrEdit";

export default function EditTransaction() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <AddTransactionScreen mode="edit" transactionId={id} />;
}
