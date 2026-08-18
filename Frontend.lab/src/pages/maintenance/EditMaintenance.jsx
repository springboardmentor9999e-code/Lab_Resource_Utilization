import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMaintenanceById } from "../../services/maintenanceService";
import MaintenanceForm from "../../components/maintenance/MaintenanceForm";
import { Box, CircularProgress } from "@mui/material";

const EditMaintenance = () => {
  const { id } = useParams();
  const [maintenanceData, setMaintenanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaintenance();
  }, [id]);

  const loadMaintenance = async () => {
    try {
      setLoading(true);
      const data = await getMaintenanceById(id);
      setMaintenanceData(data);
    } catch (error) {
      console.warn("Failed to load maintenance record:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return <MaintenanceForm isEdit={true} maintenanceData={maintenanceData || { id }} />;
};

export default EditMaintenance;
