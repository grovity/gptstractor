# 📦 GPT Proxy para Vercel

## 🚀 Qué hace
- Este proxy recibe `{ pregunta, respuesta }` de OpenAI Actions.
- Reenvía el JSON a tu Apps Script.
- Devuelve `{ "status": "ok" }`.

## ✅ Cómo usar
1. Clona este proyecto o sube estos archivos a un repositorio en GitHub.
2. Crea cuenta en [Vercel](https://vercel.com).
3. Conecta tu repo y haz Deploy.
4. Obtén la URL pública, por ejemplo `https://gpt-proxy.vercel.app`.
5. Actualiza `openapi.yaml` con tu URL de Vercel.
6. Sube `openapi.yaml` a tu Custom GPT en OpenAI.

## ✅ Prueba rápida
```bash
curl -X POST "https://gpt-proxy.vercel.app/guardarConversacion" \
     -H "Content-Type: application/json" \
     -d '{"pregunta":"Prueba","respuesta":"OK"}'
```

Si devuelve `{ "status": "ok" }` → ¡todo perfecto!

---

## ⚡ Soporte
Cualquier ajuste, revisa `SCRIPT_URL` en `index.js`.
