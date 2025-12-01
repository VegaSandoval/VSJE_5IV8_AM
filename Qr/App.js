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
  ScrollView, 
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Sharing from "expo-sharing";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  // Modo cámara para foto de perfil
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState("back"); // back = trasera por defecto
  const [photoUri, setPhotoUri] = useState(null);

  // Modo escáner QR
  const [showQr, setShowQr] = useState(false);
  const [qrScanned, setQrScanned] = useState(false);
  const [qrRaw, setQrRaw] = useState(null);
  const [qrAnalysis, setQrAnalysis] = useState(null);

  // Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ---- Manejo de permisos ----
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

  // ---- Funciones de cámara (foto de perfil) ----
  const takePhoto = async () => {
    try {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri);      // se cambia la foto de perfil
      setShowCamera(false);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudo tomar la foto.");
    }
  };

  const sharePhoto = async () => {
    if (!photoUri) {
      Alert.alert("Sin foto", "Primero toma una foto.");
      return;
    }
    await Sharing.shareAsync(photoUri);
  };

  // ---- Login Firebase ----
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

// ---- Análisis de QR (seguridad genérica) ----
const analyzeQrData = (raw) => {
  const result = {
    raw,
    isUrl: false,
    verdict: "unknown", // 'safe' | 'warning' | 'unknown'
    domain: null,
    description: "",
  };

  if (!raw) {
    result.description = "No se encontró contenido en el código QR.";
    return result;
  }

  const trimmed = raw.trim();
  const urlPattern = /^https?:\/\/\S+/i;

  // Si no parece ser un enlace http/https
  if (!urlPattern.test(trimmed)) {
    result.description =
      "El código QR contiene texto u otro tipo de dato, no un enlace web.";
    return result;
  }

  try {
    const url = new URL(trimmed);
    const hostname = url.hostname.toLowerCase();
    const protocol = url.protocol; // 'http:' o 'https:'

    result.isUrl = true;
    result.domain = hostname;

    if (protocol === "https:") {
      // Consideramos más seguro por usar HTTPS
      result.verdict = "safe";
      result.description =
        "El enlace usa HTTPS (conexión cifrada). Aun así, verifica que el dominio sea de confianza antes de abrirlo.";
    } else {
      // http: sin cifrado
      result.verdict = "warning";
      result.description =
        "El enlace no usa HTTPS. La conexión puede no ser segura; revisa bien el dominio antes de continuar.";
    }
  } catch (e) {
    result.description =
      "No se pudo analizar el enlace. Es posible que el formato no sea válido.";
  }

  return result;
};


  const handleQrScanned = ({ data }) => {
    setQrScanned(true);
    setQrRaw(data);
    setQrAnalysis(analyzeQrData(data));
  };

  // ---- Pantalla de CÁMARA para foto de perfil ----
  if (showCamera) {
    return (
      <SafeAreaView style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType}
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

// ---- Pantalla de ESCÁNER QR ----
if (showQr) {
  return (
    <SafeAreaView style={styles.cameraContainer}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={qrScanned ? undefined : handleQrScanned}
      />

      <ScrollView
        style={styles.qrScroll}
        contentContainerStyle={styles.qrScrollContent}
      >
        {qrRaw && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Contenido del QR:</Text>
            <Text style={styles.resultText}>{qrRaw}</Text>
          </View>
        )}

        {qrAnalysis && (
          <View
            style={[
              styles.analysisBox,
              qrAnalysis.verdict === "safe"
                ? styles.analysisSafe
                : qrAnalysis.verdict === "warning"
                ? styles.analysisWarning
                : styles.analysisNeutral,
            ]}
          >
            <Text style={styles.analysisTitle}>
              {qrAnalysis.verdict === "safe"
                ? "Enlace seguro"
                : qrAnalysis.verdict === "warning"
                ? "Posible enlace sospechoso"
                : "Contenido no reconocido como enlace"}
            </Text>

            <Text style={styles.analysisText}>{qrAnalysis.description}</Text>

            {qrAnalysis.domain && (
              <Text style={styles.analysisDomain}>
                Dominio: {qrAnalysis.domain}
              </Text>
            )}

            <Text style={styles.analysisHint}>
              El enlace no se abrirá automáticamente. Revisa esta evaluación
              antes de decidir qué hacer.
            </Text>
          </View>
        )}

        {qrScanned && (
          <TouchableOpacity
            style={[styles.btnAccept, { marginTop: 10 }]}
            onPress={() => {
              setQrScanned(false);
              setQrRaw(null);
              setQrAnalysis(null);
            }}
          >
            <Text style={styles.btnAcceptText}>Volver a escanear</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.btnAccept, { backgroundColor: "#333", marginTop: 10 }]}
          onPress={() => {
            setShowQr(false);
            setQrScanned(false);
            setQrRaw(null);
            setQrAnalysis(null);
          }}
        >
          <Text style={styles.btnAcceptText}>Cerrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}


  // ---- Pantalla PRINCIPAL (login + foto perfil + botones) ----
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Inicio de Sesion</Text>

        <Image
          source={
            photoUri
              ? { uri: photoUri }
              : require("./assets/default-user.png") // imagen predeterminada
          }
          style={styles.profileImage}
        />

        <TouchableOpacity style={styles.btnSecondary} onPress={sharePhoto}>
          <Text style={styles.btnSecondaryText}>COMPARTIR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => {
            setShowCamera(true);
            setShowQr(false);
          }}
        >
          <Text style={styles.btnSecondaryText}>TOMAR UNA FOTO</Text>
        </TouchableOpacity>

        {/* Nuevo botón para el QR */}
        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => {
            setShowQr(true);
            setShowCamera(false);
            setQrScanned(false);
            setQrRaw(null);
            setQrAnalysis(null);
          }}
        >
          <Text style={styles.btnSecondaryText}>ESCANEAR QR</Text>
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

// ---- Estilos ----
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
    width: "80%",
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
    height: "70%",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0f29",
  },
  // Estilos QR
  resultBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#111827",
  },
  resultTitle: {
    color: "#a5b4fc",
    fontWeight: "700",
    marginBottom: 4,
  },
  resultText: {
    color: "#e5e7eb",
    fontSize: 13,
  },
  analysisBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
  },
  analysisSafe: {
    backgroundColor: "#14532d",
    borderColor: "#22c55e",
    borderWidth: 1,
  },
  analysisWarning: {
    backgroundColor: "#450a0a",
    borderColor: "#ef4444",
    borderWidth: 1,
  },
  analysisNeutral: {
    backgroundColor: "#111827",
    borderColor: "#4b5563",
    borderWidth: 1,
  },
  analysisTitle: {
    color: "#f9fafb",
    fontWeight: "700",
    marginBottom: 4,
  },
  analysisText: {
    color: "#e5e7eb",
    fontSize: 13,
  },
  analysisDomain: {
    marginTop: 4,
    color: "#e5e7eb",
    fontSize: 12,
    fontStyle: "italic",
  },
  analysisHint: {
    marginTop: 6,
    color: "#d1d5db",
    fontSize: 12,
  },
  qrScroll: {
  flexGrow: 0,
  paddingHorizontal: 16,
  maxHeight: "40%",   // la parte de abajo ocupa ~40% de la pantalla
},
qrScrollContent: {
  paddingBottom: 20,
},

});
