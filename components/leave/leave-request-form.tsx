"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LeaveRequestFormProps {
  onSuccess: () => void;
}

export default function LeaveRequestForm({ onSuccess }: LeaveRequestFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [daysCalculated, setDaysCalculated] = useState(0);
  const { toast } = useToast();

  const calculateDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Set hours to 0 to compare only dates
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // If start date is greater than end date, return 0
    if (start > end) return 0;

    // Calculate difference in days
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

    return days;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const requestData = {
        ...formData,
        numberOfDays: daysCalculated,
        status: "PENDING",
      };

      const response = await fetch("/api/leave-requests", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Leave request submitted successfully",
        });
        onSuccess();
        setFormData({ type: "", startDate: "", endDate: "", reason: "" });
        setDaysCalculated(0);
      } else {
        throw new Error(data.message || "Failed to submit request");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit leave request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Recalculate days when dates change
    if (field === "startDate" || field === "endDate") {
      const days = calculateDays(newFormData.startDate, newFormData.endDate);
      setDaysCalculated(days);
    }
  };

  const getLeaveBalance = (type: string) => {
    if (!user) return 0;
    const balance = user.leaveBalance.find((b) => b.type === type);
    return balance ? balance.remaining : 0;
  };

  const selectedTypeBalance = formData.type
    ? getLeaveBalance(formData.type)
    : 0;
  const isInsufficientBalance = daysCalculated > selectedTypeBalance;
  const isZeroBalance = selectedTypeBalance === 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Leave Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => handleChange("type", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select leave type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="annual">
              Annual Leave ({getLeaveBalance("annual")} days remaining)
            </SelectItem>
            <SelectItem value="sick">
              Sick Leave ({getLeaveBalance("sick")} days remaining)
            </SelectItem>
            <SelectItem value="personal">
              Personal Leave ({getLeaveBalance("personal")} days remaining)
            </SelectItem>
            <SelectItem value="emergency">
              Emergency Leave ({getLeaveBalance("emergency")} days remaining)
            </SelectItem>
          </SelectContent>
        </Select>
        {formData.type && isZeroBalance && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have no remaining {formData.type} leave days available.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
            required
            min={new Date().toISOString().split("T")[0]} // Prevent past dates
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => handleChange("endDate", e.target.value)}
            required
            min={formData.startDate || new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      {/* Days calculation and balance check */}
      {daysCalculated > 0 && formData.type && (
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Days Requested:</span>
            <span className="text-sm font-bold">{daysCalculated}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Available Balance:</span>
            <span className="text-sm font-bold">{selectedTypeBalance}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Remaining After:</span>
            <span
              className={`text-sm font-bold ${
                isInsufficientBalance ? "text-red-600" : "text-green-600"
              }`}
            >
              {isInsufficientBalance
                ? "Insufficient Balance"
                : selectedTypeBalance - daysCalculated}
            </span>
          </div>
          {isInsufficientBalance && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You don't have enough {formData.type} leave days. You need{" "}
                {daysCalculated} days but only have {selectedTypeBalance}{" "}
                remaining.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          value={formData.reason}
          onChange={(e) => handleChange("reason", e.target.value)}
          placeholder="Please provide a reason for your leave request"
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={
          loading ||
          isInsufficientBalance ||
          isZeroBalance ||
          daysCalculated === 0
        }
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Request"
        )}
      </Button>
    </form>
  );
}
