// App.js
import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Sharing from "expo-sharing";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const [showCamera, setShowCamera] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [cameraType, setCameraType] = useState("back"); // back = trasera (default)


  if (!permission) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: "#fff" }}>Cargando permisos...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: "#fff", marginBottom: 10 }}>
          Necesitamos acceso a la cámara
        </Text>
        <TouchableOpacity style={styles.btnAccept} onPress={requestPermission}>
          <Text style={styles.btnAcceptText}>Permitir</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // 📸 Tomar foto
  const takePhoto = async () => {
    try {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri);
      setShowCamera(false);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudo tomar la foto.");
    }
  };

  // 📤 Compartir foto
  const sharePhoto = async () => {
    if (!photoUri) {
      Alert.alert("Sin foto", "Primero toma una foto.");
      return;
    }
    await Sharing.shareAsync(photoUri);
  };

  // 🔐 Iniciar sesión con Firebase
  const loginUser = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Llena todos los campos.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Éxito", "Inicio de sesión correcto.");
    } catch (error) {
      Alert.alert("Error", "Credenciales incorrectas o usuario inexistente.");
    }
  };

  // 📷 Vista de cámara
  if (showCamera) {
    return (
      <SafeAreaView style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType} // ← conmutador de cámara
        />
  
        <TouchableOpacity style={styles.btnAccept} onPress={takePhoto}>
          <Text style={styles.btnAcceptText}>Capturar Foto</Text>
        </TouchableOpacity>
  
        <TouchableOpacity
          style={[styles.btnAccept, { backgroundColor: "#555", marginTop: 10 }]}
          onPress={() =>
            setCameraType((prev) => (prev === "back" ? "front" : "back"))
          }
        >
          <Text style={styles.btnAcceptText}>Cambiar cámara</Text>
        </TouchableOpacity>
  
        <TouchableOpacity
          style={[styles.btnAccept, { backgroundColor: "#333", marginTop: 10 }]}
          onPress={() => setShowCamera(false)}
        >
          <Text style={styles.btnAcceptText}>Cancelar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Inicio de Sesion</Text>

        <Image
          source={
            photoUri
              ? { uri: photoUri }
              : require("./assets/default-user.png") // ← tu imagen por defecto
          }
          style={styles.profileImage}
        />

        <TouchableOpacity style={styles.btnSecondary} onPress={sharePhoto}>
          <Text style={styles.btnSecondaryText}>COMPARTIR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => setShowCamera(true)}
        >
          <Text style={styles.btnSecondaryText}>TOMAR UNA FOTO</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Nombre de usuario:</Text>
        <TextInput
          style={styles.input}
          placeholder="Correo"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Contraseña:</Text>
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.btnAccept} onPress={loginUser}>
          <Text style={styles.btnAcceptText}>ACEPTAR</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// 🎨 Estilos basados en tu imagen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0f29",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#11182f",
    width: "85%",
    padding: 20,
    borderRadius: 25,
    borderColor: "#4a6cff",
    borderWidth: 2,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#4a6cff",
    marginBottom: 15,
  },
  btnSecondary: {
    backgroundColor: "#1d2951",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 25,
    marginTop: 8,
  },
  btnSecondaryText: {
    color: "#aabaff",
    fontSize: 14,
    textAlign: "center",
  },
  label: {
    color: "#fff",
    alignSelf: "flex-start",
    marginTop: 15,
    marginLeft: 5,
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 5,
  },
  btnAccept: {
    backgroundColor: "#304ffe",
    marginTop: 20,
    paddingVertical: 12,
    width: "60%",
    borderRadius: 10,
  },
  btnAcceptText: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
    fontWeight: "bold",
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  camera: {
    width: "100%",
    height: "80%",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0f29",
  },
});
