import { Upload, message } from "antd";
import type { UploadProps } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const BUCKET = "documents";

export interface FileUploadProps {
  path?: string;
  onSuccess?: (url: string, fileName: string) => void;
  accept?: string;
  maxCount?: number;
}

export default function FileUpload({ path = "uploads", onSuccess, accept, maxCount = 5 }: FileUploadProps) {
  const uploadProps: UploadProps = {
    name: "file",
    multiple: maxCount > 1,
    maxCount,
    accept,
    showUploadList: true,
    customRequest: async ({ file, onSuccess: os, onError }) => {
      if (!supabase) {
        message.warning("Supabase not configured. Using placeholder URL.");
        const url = `https://placeholder.local/${(file as File).name}`;
        onSuccess?.(url, (file as File).name);
        os?.("ok");
        return;
      }
      try {
        const ext = (file as File).name.split(".").pop();
        const name = `${path}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { data, error } = await supabase.storage.from(BUCKET).upload(name, file, { upsert: true });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
        onSuccess?.(urlData.publicUrl, (file as File).name);
        os?.("ok");
      } catch (e) {
        message.error("Upload failed");
        onError?.(e as Error);
      }
    },
  };

  return (
    <Upload.Dragger {...uploadProps}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined style={{ fontSize: 48, color: "#1677ff" }} />
      </p>
      <p className="ant-upload-text">Click or drag file to upload</p>
    </Upload.Dragger>
  );
}
