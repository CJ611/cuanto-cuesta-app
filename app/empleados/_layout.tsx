import { Stack } from 'expo-router';

export default function EmpleadosLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="create" />
      <Stack.Screen name="list" />
    </Stack>
  );
}
