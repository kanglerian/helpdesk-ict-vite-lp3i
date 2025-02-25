import React from 'react'

const License = () => {
  return (
    <div className="text-sm leading-relaxed p-8">
      <h2 className="text-lg font-semibold">📜 Lisensi Penggunaan Aplikasi</h2>

      <p><strong>Nama Aplikasi:</strong> Helpdesk ICT</p>
      <p><strong>Pemilik:</strong> Lerian Febriana</p>

      <p>Aplikasi ini merupakan hak eksklusif dari Lerian Febriana. Dengan menggunakan aplikasi ini, pengguna menyetujui ketentuan berikut:</p>

      <h3 className="font-semibold mt-4">🔒 Hak Cipta & Kepemilikan</h3>
      <ul className="list-disc pl-5">
        <li>Aplikasi ini sepenuhnya dimiliki oleh Lerian Febriana dan dilindungi oleh hukum hak cipta yang berlaku.</li>
        <li>Pengguna tidak diperbolehkan mengklaim, mengubah, atau menghapus hak cipta ini.</li>
      </ul>

      <h3 className="font-semibold mt-4">🚫 Larangan Penggunaan Tanpa Izin</h3>
      <ul className="list-disc pl-5">
        <li>Dilarang menjual, menyewakan, mendistribusikan, atau memberikan aplikasi ini kepada pihak lain tanpa izin tertulis dari pemilik.</li>
        <li>Penggunaan aplikasi ini hanya diperbolehkan sesuai dengan ketentuan yang ditetapkan oleh pemilik.</li>
      </ul>

      <h3 className="font-semibold mt-4">⚙️ Modifikasi & Reverse Engineering</h3>
      <ul className="list-disc pl-5">
        <li>Pengguna tidak diperbolehkan untuk memodifikasi, mendekompilasi, atau melakukan reverse engineering terhadap aplikasi ini dalam bentuk apa pun.</li>
      </ul>

      <h3 className="font-semibold mt-4">⚠️ Pelanggaran & Konsekuensi Hukum</h3>
      <ul className="list-disc pl-5">
        <li>Pelanggaran terhadap ketentuan ini dapat mengakibatkan tindakan hukum sesuai dengan peraturan yang berlaku.</li>
      </ul>

      <hr className="my-4" />

      <p className="font-semibold">📌 PERHATIAN:</p>
      <p>Dengan menggunakan aplikasi ini, Anda menyetujui seluruh ketentuan yang tercantum dalam lisensi ini.</p>

      <p className="mt-4">📧 <strong>Kontak:</strong> <a href="mailto:kanglerian@gmail.com" className="text-sky-600">kanglerian@gmail.com</a></p>
    </div>
  )
}

export default License